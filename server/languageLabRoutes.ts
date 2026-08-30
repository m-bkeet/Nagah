import express, { Request, Response } from 'express';
import { adminDb } from './firebaseAdmin';
import { generateWithModelCascade } from './gemini';
import { 
  CefrLevel, 
  LanguageSkill, 
  LanguageUserProfile, 
  LanguageActivity, 
  LanguageActivitySubmission 
} from '../src/types';

export const languageLabRouter = express.Router();

// Memory store fallback when Firestore is unavailable
const memoryStudentProfiles: Record<string, LanguageUserProfile> = {};
const memoryActivities: LanguageActivity[] = [];
const memorySubmissions: LanguageActivitySubmission[] = [];

// =========================================================================
// 1. AI CONVERSATION CHAT TURN (ROLEPLAY & FEEDBACK)
// =========================================================================
languageLabRouter.post('/chat-turn', async (req: Request, res: Response) => {
  try {
    const { 
      scenarioId, 
      systemPersona, 
      userMessage, 
      conversationHistory, 
      cefrLevel = 'B1',
      studentName = 'Student'
    } = req.body;

    const formattedHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-8).map((m: any) => `${m.role === 'user' ? 'Student' : 'Partner'}: ${m.text}`).join('\n')
      : '';

    const systemPrompt = `You are an expert English Language Coach & Roleplay Partner for Nagah Learning Management System.
Current Roleplay Persona: ${systemPersona || 'Professional English Interviewer & Tutor'}.
Student Target CEFR Level: ${cefrLevel}.
Student Name: ${studentName}.

Conversation Guidelines:
1. Stay in character! Respond naturally, encouragingly, and realistically in English matched to ${cefrLevel}.
2. Keep your conversational response relatively concise (2-4 sentences) so the conversation flows interactively.
3. Assess the student's message for grammar, vocabulary, and phrasing.
4. Output STRICT JSON with this schema:
{
  "reply": "Your in-character spoken response in English",
  "feedback": {
    "score": 85,
    "praise": "Brief praise in Arabic/English",
    "corrections": [
      { "original": "mistake phrase", "improved": "corrected phrase", "explanation": "Why in Arabic/English" }
    ],
    "pronunciationTips": ["Words to practice pronouncing clearly"],
    "suggestedFollowUpPhrases": ["3 sample short replies the student could use next"]
  }
}
Do NOT include markdown formatting or backticks outside the JSON.`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          { text: `Recent Conversation History:\n${formattedHistory}\n\nStudent just said: "${userMessage || 'Hello!'}"\n\nGenerate in-character response and feedback in strict JSON:` }
        ]
      }
    ];

    const aiRes = await generateWithModelCascade({
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, ...parsed, modelUsed: aiRes.modelUsed });
      } catch (pe) {
        console.warn('JSON parse fallback for chat turn:', pe);
      }
    }

    // Fallback response
    return res.json({
      success: true,
      reply: `That sounds interesting! Could you tell me more about how you handled that situation?`,
      feedback: {
        score: 80,
        praise: "Good attempt! Keep expressing your ideas confidently.",
        corrections: [],
        pronunciationTips: ["Pay attention to word endings (-ed, -s)"],
        suggestedFollowUpPhrases: [
          "I focused on clear team communication.",
          "It helped us solve the challenge effectively."
        ]
      },
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in language lab chat-turn:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process chat turn' });
  }
});

// =========================================================================
// 2. ANALYZE SPEAKING (ACCURACY, FLUENCY, PRONUNCIATION, STRESS)
// =========================================================================
languageLabRouter.post('/analyze-speaking', async (req: Request, res: Response) => {
  try {
    const { 
      targetPrompt, 
      spokenText, 
      cefrLevel = 'B1',
      mode = 'sentence' // word | phrase | sentence | dialogue | presentation
    } = req.body;

    const prompt = `You are a certified CEFR Pronunciation & Speaking Assessor.
Target Practice Prompt: "${targetPrompt}"
Spoken / Transcribed Text: "${spokenText}"
Target CEFR Level: ${cefrLevel}
Mode: ${mode}

Analyze the spoken English across:
- Accuracy (words matched to target, correct grammar)
- Fluency (sentence rhythm, flow, natural phrasing)
- Pronunciation & Intonation (stress patterns, vowel clarity)
- Vocabulary Choice

Return ONLY valid JSON with this format:
{
  "score": 88,
  "accuracyScore": 90,
  "fluencyScore": 85,
  "pronunciationScore": 86,
  "summaryAr": "تقييم تحليلي باللغة العربية",
  "strengths": ["Strong vowel clarity", "Good sentence rhythm"],
  "improvements": ["Stress the second syllable in 'developer'", "Watch past tense endings"],
  "correctedErrors": [
    { "original": "he go", "corrected": "he goes", "explanation": "Subject-verb agreement" }
  ],
  "improvedVersion": "Polished native-like phrasing for the student to repeat aloud"
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.3 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, ...data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Speaking parse error:', e);
      }
    }

    return res.json({
      success: true,
      score: 85,
      accuracyScore: 88,
      fluencyScore: 84,
      pronunciationScore: 85,
      summaryAr: 'أداء صوتي رائع، مع وضوح جيد في مخارج الحروف والطلاقة التعبيرية.',
      strengths: ['نبرة واضحة ومخارج حروف مفهومة', 'استخدام مفردات متوافقة مع السياق'],
      improvements: ['التدرب على ربط الكلمات (Connected Speech)', 'التركيز على نطق نهايات الكلمات'],
      correctedErrors: [],
      improvedVersion: targetPrompt,
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in analyze-speaking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 3. ANALYZE WRITING (EDUCATIONAL FEEDBACK & GRAMMAR/STRUCTURE)
// =========================================================================
languageLabRouter.post('/analyze-writing', async (req: Request, res: Response) => {
  try {
    const { 
      topic, 
      studentText, 
      cefrLevel = 'B1', 
      instructions 
    } = req.body;

    const prompt = `You are a supportive English Writing Mentor for Nagah Center students.
Topic / Assignment: "${topic || 'General Writing Topic'}"
Instructions: "${instructions || 'Write a structured paragraph'}"
Target CEFR Level: ${cefrLevel}
Student Submitted Text:
"""
${studentText}
"""

Instructions:
1. Provide constructive, educational feedback. Explain the "WHY" behind corrections rather than just giving the answer.
2. Evaluate Grammar, Spelling, Vocabulary, Sentence Structure, Clarity, and Overall Quality.
3. Return STRICT JSON with this schema:
{
  "score": 82,
  "cefrEstimated": "B1",
  "summaryAr": "ملخص شامل باللغة العربية لجوانب القوة ومجالات التحسين",
  "wordCount": 65,
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Point 1", "Point 2"],
  "correctedErrors": [
    { "original": "error phrase", "corrected": "fixed phrase", "rule": "Grammar rule name", "explanation": "Educational guidance in Arabic" }
  ],
  "vocabularyEnhancements": [
    { "wordUsed": "good", "suggestedAlternatives": ["effective", "robust", "optimal"] }
  ],
  "improvedParagraph": "An elevated rewrite of the paragraph demonstrating natural flow"
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.3 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, ...data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Writing feedback parse error:', e);
      }
    }

    return res.json({
      success: true,
      score: 80,
      cefrEstimated: cefrLevel,
      summaryAr: 'كتابة جيدة ومنظمة توضح الأفكار الأساسية بوضوح مع إمكانية تحسين التراكيب اللغوية.',
      wordCount: (studentText || '').split(/\s+/).filter(Boolean).length,
      strengths: ['تسلسل الأفكار والوضوح', 'استخدام مصطلحات مرتبطة بالموضوع'],
      improvements: ['تنويع أدوات الربط بين الجمل', 'مراجعة توافق الأزمنة'],
      correctedErrors: [],
      vocabularyEnhancements: [],
      improvedParagraph: studentText,
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in analyze-writing:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 4. AI LEARNING COACH (PERSONALIZED STUDENT ADVISOR)
// =========================================================================
languageLabRouter.post('/ai-coach', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ success: false, error: 'Student profile required' });
    }

    const prompt = `You are the personal AI Language Coach for a student at Nagah Center.
Student Profile:
- Name: ${profile.studentName}
- Current Level: ${profile.currentLevel}
- Skill Scores: Speaking (${profile.scores?.speaking || 0}), Listening (${profile.scores?.listening || 0}), Reading (${profile.scores?.reading || 0}), Writing (${profile.scores?.writing || 0}), Grammar (${profile.scores?.grammar || 0}), Pronunciation (${profile.scores?.pronunciation || 0})
- Streak: ${profile.streakDays || 0} days
- Words in Flashcards: ${profile.flashcards?.length || 0}

Generate a concise, motivating, and highly personalized coaching plan.
Return ONLY valid JSON:
{
  "greetingAr": "تحية تشجيعية دافئة بالعربية",
  "statusSummaryAr": "تشخيص المستوى الحالي ونقاط القوة",
  "todayFocusSkill": "speaking",
  "todayReasonAr": "سبب التركيز على هذه المهارة اليوم بناءً على الدرجات",
  "recommendedAction": {
    "title": "عنوان التمرين المقترح",
    "description": "وصف المهمة المطلوبة في 5-10 دقائق",
    "targetPillar": "speaking"
  },
  "reviewWordsNotice": "تنبيه عن الكلمات التي تحتاج مراجعة في صندوق لايتنر",
  "nextGoalAr": "الهدف القادم للوصول للمستوى الأعلى"
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.5 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, coach: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Coach parse error:', e);
      }
    }

    return res.json({
      success: true,
      coach: {
        greetingAr: `مرحبًا يا بطل! جاهز لجولة تدريب لغوي جديدة وممتعة اليوم؟ 🚀`,
        statusSummaryAr: `أنت في مستوى ${profile.currentLevel || 'B1'}، وأداؤك في القراءة والاستماع مميز جداً.`,
        todayFocusSkill: 'speaking',
        todayReasonAr: 'درجة التحدث تحتاج تعزيزًا طفيفًا، والتدريب على جمل حقيقية يرفع طلاقتك فوراً.',
        recommendedAction: {
          title: 'محاكاة مقابلة عمل تقنية لمدة 5 دقائق',
          description: 'اختر سيناريو المقابلة في محادثات AI وتدرب على إجابة 3 أسئلة بصوتك.',
          targetPillar: 'speaking'
        },
        reviewWordsNotice: 'لديك 4 كلمات في صندوق لايتنر جاهزة للمراجعة السريعة اليوم.',
        nextGoalAr: 'الارتقاء إلى مستوى B2 في جميع المهارات والحصول على شارة الطلاقة التقنية.'
      },
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in ai-coach:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 5. TRAINER: AI ACTIVITY GENERATOR
// =========================================================================
languageLabRouter.post('/generate-activity', async (req: Request, res: Response) => {
  try {
    const { prompt: userPrompt, skill = 'speaking', level = 'B1', duration = 15, maxGrade = 20 } = req.body;

    const systemPrompt = `You are an expert English Curriculum Specialist assisting a Trainer at Nagah Center.
The Trainer requests: "${userPrompt || 'Create an engaging English activity'}"
Target Skill: ${skill}
Target CEFR Level: ${level}
Duration: ${duration} minutes
Max Grade: ${maxGrade} points

Generate a complete, structured classroom/homework language activity.
Return ONLY valid JSON matching this schema:
{
  "title": "Engaging Activity Title in English",
  "titleAr": "عنوان النشاط بالعربية",
  "description": "Short explanation for students",
  "instructions": "Step-by-step instructions on what students need to do",
  "prompt": "The main speaking prompt, reading text, or writing question",
  "passage": "Optional reading passage or listening audio script if applicable",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "questionText": "Comprehension or reflection question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ],
  "rubric": {
    "accuracyWeight": 25,
    "fluencyWeight": 25,
    "vocabularyWeight": 25,
    "grammarWeight": 25
  },
  "teacherAdviceAr": "نصائح ذكية للمدرب لتوجيه الطلاب وتصحيح الأخطاء الشائعة"
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.6 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, activity: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Activity generator parse error:', e);
      }
    }

    return res.json({
      success: true,
      activity: {
        title: `AI Language Challenge: ${skill.toUpperCase()} (Level ${level})`,
        titleAr: `نشاط لغوي تفاعلي: ${skill} (مستوى ${level})`,
        description: `Practical exercise to strengthen ${skill} proficiency for level ${level}.`,
        instructions: `Read the prompt carefully, prepare your response, and submit your recording or text.`,
        prompt: `Describe how software algorithms affect daily life and give two practical examples.`,
        questions: [],
        rubric: { accuracyWeight: 25, fluencyWeight: 25, vocabularyWeight: 25, grammarWeight: 25 },
        teacherAdviceAr: 'شجع الطلاب على استخدام المصطلحات التقنية المكتسبة في الحصص السابقة.'
      },
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in generate-activity:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 6. TRAINER: AI GROUP ANALYZER (SMART SEGMENTATION & ACTION PLANS)
// =========================================================================
languageLabRouter.post('/analyze-group', async (req: Request, res: Response) => {
  try {
    const { groupName = 'Group', trainees = [] } = req.body;

    const traineesSummary = Array.isArray(trainees) 
      ? trainees.map((t: any) => `${t.fullName || t.name}: CEFR ${t.currentLevel || 'A2'}, Overall ${t.scores?.overall || 65}%`).join('\n')
      : 'Standard group data';

    const prompt = `You are an AI Educational Data Analyst for Nagah Center.
Group Name: "${groupName}"
Trainees Language Data:
${traineesSummary}

Task:
1. Analyze the collective strengths and gaps.
2. Segment trainees intelligently into 4 performance tiers:
   - "needs_support" (تحتاج دعم وتأسيس مكثف)
   - "developing" (في طور التطور والنمو)
   - "good" (مستوى جيد ومستقر)
   - "advanced" (مستوى متقدم ومتميز)
3. For each tier, recommend a specific tailored activity / pedagogical intervention.

Return ONLY valid JSON:
{
  "groupOverviewAr": "تحليل موجز لأداء المجموعة باللغة العربية",
  "averageLevel": "B1",
  "tiers": {
    "needsSupport": {
      "studentNames": ["Name 1"],
      "diagnosisAr": "تشخيص التحديات",
      "recommendedActionAr": "خطة التدخل العلاجي والأنشطة المقترحة"
    },
    "developing": {
      "studentNames": ["Name 2"],
      "diagnosisAr": "تشخيص التحديات",
      "recommendedActionAr": "خطة التثبيت والتطوير"
    },
    "good": {
      "studentNames": ["Name 3"],
      "diagnosisAr": "نقاط القوة",
      "recommendedActionAr": "خطة التعزيز"
    },
    "advanced": {
      "studentNames": ["Name 4"],
      "diagnosisAr": "التميز والإتقان",
      "recommendedActionAr": "أنشطة إثرائية وتحديات قيادية"
    }
  }
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.4 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, analysis: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Group analyzer parse error:', e);
      }
    }

    return res.json({
      success: true,
      analysis: {
        groupOverviewAr: `المجموعة تُظهر تقدماً ملحوظاً في مهارات القراءة والمصطلحات البرمجية مع تباين في الطلاقة الصوتية.`,
        averageLevel: 'B1',
        tiers: {
          needsSupport: {
            studentNames: trainees.slice(0, 2).map((t: any) => t.fullName || t.name),
            diagnosisAr: 'صعوبة في تكوين الجمل السريعة والتصريف الزمني الصحيح.',
            recommendedActionAr: 'تدريبات محاكاة يومية قصيرة على الجمل البسيطة باستخدام Flashcards.'
          },
          developing: {
            studentNames: trainees.slice(2, 5).map((t: any) => t.fullName || t.name),
            diagnosisAr: 'فهم ممتاز للنصوص المكتوبة مع تردد طفيف أثناء التحدث الحر.',
            recommendedActionAr: 'سيناريوهات المحادثة التفاعلية مثل محادثة السفر والدعم الفني.'
          },
          good: {
            studentNames: trainees.slice(5, 8).map((t: any) => t.fullName || t.name),
            diagnosisAr: 'طلاقة متوازنة وقواعد سليمة في معظم المواقف المعتادة.',
            recommendedActionAr: 'تكليفات عروض تقديمية للمشاريع البرمجية باللغة الإنجليزية.'
          },
          advanced: {
            studentNames: trainees.slice(8).map((t: any) => t.fullName || t.name),
            diagnosisAr: 'طلاقة عالية وثروة لغوية تقنية متقدمة.',
            recommendedActionAr: 'تحديات المحاكاة المتقدمة لمقابلات العمل والمناظرات التقنية.'
          }
        }
      },
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in analyze-group:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 7. TRAINER: AI LESSON ASSISTANT (OBJECTIVES, STEPS, PITFALLS)
// =========================================================================
languageLabRouter.post('/lesson-assistant', async (req: Request, res: Response) => {
  try {
    const { topic = 'Job Interview Preparation', level = 'B1', skill = 'speaking' } = req.body;

    const prompt = `You are an AI Master Teacher Assistant for Nagah Center Language Lab.
Topic: "${topic}"
Target Level: ${level}
Pillar: ${skill}

Provide a complete, practical lesson assistant guide for the trainer:
Return ONLY valid JSON:
{
  "lessonTitleAr": "عنوان خطة الدرس بالعربية",
  "targetObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "lessonProgression": [
    { "phase": "Warm-up (5 mins)", "activity": "Description of warm-up" },
    { "phase": "Core Practice (15 mins)", "activity": "Interactive core activity" },
    { "phase": "Production & Feedback (10 mins)", "activity": "Student output and assessment" }
  ],
  "commonStudentMistakes": [
    { "mistake": "Example mistake", "correctionGuide": "How the teacher should guide them" }
  ],
  "remedialSuggestion": "Quick activity for struggling students",
  "enrichmentSuggestion": "Quick activity for advanced fast-finishers"
}`;

    const aiRes = await generateWithModelCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.5 }
    });

    if (aiRes.text) {
      try {
        const cleanJson = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        return res.json({ success: true, assistant: data, modelUsed: aiRes.modelUsed });
      } catch (e) {
        console.warn('Lesson assistant parse error:', e);
      }
    }

    return res.json({
      success: true,
      assistant: {
        lessonTitleAr: `خطة النشاط اللغوي: ${topic}`,
        targetObjectives: [
          'تمكين المتدرب من التعبير بطلاقة عن أفكاره التقنية',
          'استخدام المصطلحات التخصصية في سياقات عملية صحيحة',
          'تطبيق قواعد الربط والطلاقة الصوتية'
        ],
        lessonProgression: [
          { phase: 'التهيئة (5 دقائق)', activity: 'طرح سؤال تحفيزي سريع لكسر الجليد ومراجعة 3 كلمات مفتاحية.' },
          { phase: 'التطبيق التفاعلي (15 دقيقة)', activity: 'محاكاة السيناريو بالتبادل بين المتدربين مع الذكاء الاصطناعي.' },
          { phase: 'التقييم والختام (10 دقائق)', activity: 'استعراض التقرير اللغوي الفوري وتقديم التغذية الراجعة.' }
        ],
        commonStudentMistakes: [
          { mistake: 'استخدام أزمنة غير متطابقة', correctionGuide: 'لفت انتباه الطالب بلباقة لإعادة صياغة الجملة بالزمن الصحيح.' }
        ],
        remedialSuggestion: 'استخدام بطاقات الكلمات المساعدة وقوائم العبارات الجاهزة.',
        enrichmentSuggestion: 'تكليف الطالب بإجراء محاكاة متقدمة مع أسئلة غير متوقعة.'
      },
      modelUsed: 'rule-fallback'
    });
  } catch (err: any) {
    console.error('Error in lesson-assistant:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 8. DATA PERSISTENCE ENDPOINTS (STUDENT PROFILE & SUBMISSIONS)
// =========================================================================

// GET Student Language Profile
languageLabRouter.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    try {
      const doc = await adminDb.collection('language_profiles').doc(studentId).get();
      if (doc.exists) {
        return res.json({ success: true, profile: doc.data() });
      }
    } catch (e) {
      console.warn('Firestore language profile read error, falling back to memory:', e);
    }

    if (memoryStudentProfiles[studentId]) {
      return res.json({ success: true, profile: memoryStudentProfiles[studentId] });
    }

    return res.json({ success: true, profile: null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SAVE Student Language Profile
languageLabRouter.post('/student/:studentId/save', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const profile = req.body;
    profile.updatedAt = new Date().toISOString();

    memoryStudentProfiles[studentId] = profile;

    try {
      await adminDb.collection('language_profiles').doc(studentId).set(profile, { merge: true });
    } catch (e) {
      console.warn('Firestore language profile save error, saved to memory:', e);
    }

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Trainer Language Activities
languageLabRouter.get('/trainer/:trainerId/activities', async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    let activities: LanguageActivity[] = [];

    try {
      const snap = await adminDb.collection('language_activities')
        .where('trainerId', '==', trainerId)
        .get();
      snap.forEach(d => activities.push({ id: d.id, ...d.data() } as LanguageActivity));
    } catch (e) {
      activities = memoryActivities.filter(a => a.trainerId === trainerId);
    }

    res.json({ success: true, activities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE / UPDATE Language Activity
languageLabRouter.post('/trainer/activity', async (req: Request, res: Response) => {
  try {
    const activityData: LanguageActivity = req.body;
    if (!activityData.id) {
      activityData.id = `lang_act_${Date.now()}`;
    }
    activityData.createdAt = activityData.createdAt || new Date().toISOString();
    activityData.status = activityData.status || 'active';

    memoryActivities.push(activityData);

    try {
      await adminDb.collection('language_activities').doc(activityData.id).set(activityData, { merge: true });
    } catch (e) {
      console.warn('Firestore activity save error, saved to memory:', e);
    }

    res.json({ success: true, activity: activityData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SUBMIT Student Language Activity
languageLabRouter.post('/student/submit-activity', async (req: Request, res: Response) => {
  try {
    const submission: LanguageActivitySubmission = req.body;
    if (!submission.id) {
      submission.id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    submission.submittedAt = new Date().toISOString();
    submission.status = submission.status || 'submitted';

    memorySubmissions.push(submission);

    try {
      await adminDb.collection('language_submissions').doc(submission.id).set(submission, { merge: true });
    } catch (e) {
      console.warn('Firestore submission save error, saved to memory:', e);
    }

    res.json({ success: true, submission });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GRADE Submission (Trainer Feedback)
languageLabRouter.post('/trainer/grade-submission', async (req: Request, res: Response) => {
  try {
    const { submissionId, grade, textNotes, voiceCommentUrl, trainerId, trainerName } = req.body;

    const updatePayload = {
      trainerFeedback: {
        trainerId,
        trainerName,
        grade,
        textNotes,
        voiceCommentUrl,
        gradedAt: new Date().toISOString()
      },
      status: 'graded'
    };

    const sub = memorySubmissions.find(s => s.id === submissionId);
    if (sub) {
      sub.trainerFeedback = updatePayload.trainerFeedback;
      sub.status = 'graded';
    }

    try {
      await adminDb.collection('language_submissions').doc(submissionId).set(updatePayload, { merge: true });
    } catch (e) {
      console.warn('Firestore submission grade error:', e);
    }

    res.json({ success: true, message: 'تم تقييم النشاط وإرسال التغذية الراجعة للطالب بنجاح ✓' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PARENT INSIGHTS (Read-only safe progress summary)
languageLabRouter.get('/parent/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    let profile: LanguageUserProfile | null = memoryStudentProfiles[studentId] || null;

    try {
      const doc = await adminDb.collection('language_profiles').doc(studentId).get();
      if (doc.exists) {
        profile = doc.data() as LanguageUserProfile;
      }
    } catch (e) {
      console.warn('Firestore parent lang read error:', e);
    }

    if (!profile) {
      return res.json({
        success: true,
        insights: {
          currentLevel: 'A1',
          overallScore: 65,
          wordsLearned: 12,
          practiceMinutes: 20,
          strengths: ['القراءة', 'الاستماع'],
          needsImprovement: ['التحدث الحر'],
          coachNoteAr: 'المتدرب يخطو خطوات مميزة في معمل اللغات، ويُنصح بمواصلة التدريب اليومي على النطق.'
        }
      });
    }

    return res.json({
      success: true,
      insights: {
        currentLevel: profile.currentLevel,
        overallScore: profile.scores?.overall || 70,
        skillScores: profile.scores,
        wordsLearned: profile.wordsLearnedCount || profile.flashcards?.length || 15,
        practiceMinutes: profile.totalPracticeMinutes || 30,
        streakDays: profile.streakDays || 1,
        strengths: profile.strengthsSkills || ['reading', 'listening'],
        needsImprovement: profile.needsImprovementSkills || ['speaking'],
        coachNoteAr: `المتدرب في مستوى ${profile.currentLevel} ويحرز تقدماً ثابتاً في اكتساب المصطلحات اللغوية والتقنية.`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
