import { 
  CefrLevel, 
  LanguageSkill, 
  LanguageSkillScores, 
  VocabularyCard, 
  ConversationScenario, 
  LanguageUserProfile, 
  LanguageDiagnosticResult,
  LanguageActivity,
  LanguageActivitySubmission
} from '../types';

// =========================================================================
// 1. DEFAULT TECHNICAL ENGLISH WORD BANKS FOR NAGAH LMS
// =========================================================================

export const TECHNICAL_VOCABULARY_SEED: Omit<VocabularyCard, 'id' | 'leitnerBox' | 'timesCorrect' | 'timesWrong'>[] = [
  // Programming & Logic
  {
    word: 'Algorithm',
    phonetic: '/ˈæl.ɡə.rɪ.ðəm/',
    translation: 'خوارزمية (مجموعة خطوات منطقية مرتبة لحل مشكلة)',
    partOfSpeech: 'noun',
    definition: 'A step-by-step procedure or set of rules to solve a specific computational problem.',
    exampleSentence: 'Binary search is an efficient algorithm with O(log n) time complexity.',
    exampleTranslation: 'البحث الثنائي هو خوارزمية فعالة بتعقيد زمني من رتبة O(log n).',
    category: 'programming',
    cefrLevel: 'B1'
  },
  {
    word: 'Polymorphism',
    phonetic: '/ˌpɒl.iˈmɔː.fɪ.zəm/',
    translation: 'تعدد الأشكال (مفهوم برمجي لتغيير سلوك الدوال)',
    partOfSpeech: 'noun',
    definition: 'An OOP principle that allows entities to take on different forms depending on context.',
    exampleSentence: 'Polymorphism allows subclasses to override methods of their parent class.',
    exampleTranslation: 'يتيح تعدد الأشكال للفئات الفرعية تجاوز وتعديل دوال الفئة الأم.',
    category: 'programming',
    cefrLevel: 'B2'
  },
  {
    word: 'Encapsulation',
    phonetic: '/ɪnˌkæp.sjəˈleɪ.ʃən/',
    translation: 'التغليف (حماية البيانات داخل الكائن وإخفاء التفاصيل)',
    partOfSpeech: 'noun',
    definition: 'Bundling data and methods that operate on that data within a single unit and restricting direct access.',
    exampleSentence: 'Encapsulation prevents unauthorized external modification of internal states.',
    exampleTranslation: 'يمنع التغليف التعديل الخارجي غير المصرح به على الحالات الداخلية.',
    category: 'programming',
    cefrLevel: 'B2'
  },
  {
    word: 'Recursion',
    phonetic: '/rɪˈkɜː.ʃən/',
    translation: 'الاستدعاء الذاتي / التكرار العودي',
    partOfSpeech: 'noun',
    definition: 'A programming technique in which a function calls itself to solve smaller instances of the problem.',
    exampleSentence: 'Always define a base case to prevent stack overflow in recursion.',
    exampleTranslation: 'حدد دائمًا شرط التوقف (base case) لتجنب تجاوز سعة المكدس في الاستدعاء الذاتي.',
    category: 'programming',
    cefrLevel: 'B2'
  },
  {
    word: 'Asynchronous',
    phonetic: '/eɪˈsɪŋ.krə.nəs/',
    translation: 'غير متزامن (تنفيذ المهام دون تجميد واجهة المستخدم)',
    partOfSpeech: 'adjective',
    definition: 'Operations executed independently of the main program flow, not blocking further execution.',
    exampleSentence: 'JavaScript uses promises and async/await to handle asynchronous API requests.',
    exampleTranslation: 'تستخدم جافاسكريبت الوعود و async/await للتعامل مع طلبات API غير المتزامنة.',
    category: 'web',
    cefrLevel: 'B2'
  },
  // AI & Data Science
  {
    word: 'Neural Network',
    phonetic: '/ˈnjʊə.rəl ˈnet.wɜːk/',
    translation: 'شبكة عصبية اصطناعية',
    partOfSpeech: 'noun',
    definition: 'A computational model inspired by the human brain, composed of interconnected nodes.',
    exampleSentence: 'Deep neural networks excel at image recognition and natural language processing.',
    exampleTranslation: 'تتفوق الشبكات العصبية العميقة في التعرف على الصور ومعالجة اللغة الطبيعية.',
    category: 'ai',
    cefrLevel: 'B1'
  },
  {
    word: 'Fine-Tuning',
    phonetic: '/faɪn ˈtjuː.nɪŋ/',
    translation: 'الضبط الدقيق (إعادة تدريب نموذج ذكاء اصطناعي على بيانات مخصصة)',
    partOfSpeech: 'noun',
    definition: 'Adapting a pre-trained machine learning model to a specialized domain with specific datasets.',
    exampleSentence: 'We performed fine-tuning on the LLM using our technical documentation.',
    exampleTranslation: 'أجرينا ضبطًا دقيقًا للنموذج اللغوي باستخدام وثائقنا التقنية.',
    category: 'ai',
    cefrLevel: 'B2'
  },
  {
    word: 'Prompt Engineering',
    phonetic: '/prɒmpt ˌen.dʒɪˈnɪə.rɪŋ/',
    translation: 'هندسة الأوامر والمطالبات الذكية',
    partOfSpeech: 'noun',
    definition: 'The practice of designing optimal input prompts to guide generative AI outputs.',
    exampleSentence: 'Effective prompt engineering significantly improves Gemini response accuracy.',
    exampleTranslation: 'تؤدي هندسة الأوامر الفعالة إلى تحسين دقة استجابة Gemini بشكل كبير.',
    category: 'ai',
    cefrLevel: 'B1'
  },
  {
    word: 'Inference',
    phonetic: '/ˈɪn.fər.əns/',
    translation: 'الاستدلال / التنبؤ في الذكاء الاصطناعي',
    partOfSpeech: 'noun',
    definition: 'The phase where a trained AI model produces predictions on unseen incoming data.',
    exampleSentence: 'Optimizing inference speed reduces API latency on cloud production servers.',
    exampleTranslation: 'تحسين سرعة الاستدلال يقلل زمن استجابة API على خوادم السحابة.',
    category: 'ai',
    cefrLevel: 'C1'
  },
  // Web & Architecture
  {
    word: 'Middleware',
    phonetic: '/ˈmɪd.əl.weər/',
    translation: 'برمجية وسيطة (معالجة الطلبات بين العميل والخادم)',
    partOfSpeech: 'noun',
    definition: 'Software that acts as a bridge between an operating system or database and applications.',
    exampleSentence: 'Authentication middleware verifies JSON Web Tokens before granting access.',
    exampleTranslation: 'تتحقق البرمجية الوسيطة للمصادقة من رموز JWT قبل منح صلاحية الوصول.',
    category: 'software',
    cefrLevel: 'B2'
  },
  {
    word: 'Scalability',
    phonetic: '/ˌskeɪ.ləˈbɪl.ə.ti/',
    translation: 'القابلية للتوسع والنمو تحت ضغط الاستخدام',
    partOfSpeech: 'noun',
    definition: 'The capability of a system to handle a growing amount of work by adding resources.',
    exampleSentence: 'Microservices architecture enhances horizontal scalability under heavy traffic.',
    exampleTranslation: 'تعزز بنية الخدمات المصغرة التوسع الأفقي أثناء زيادة تدفق الزوار.',
    category: 'software',
    cefrLevel: 'B2'
  },
  {
    word: 'Idempotent',
    phonetic: '/aɪˈdem.pə.tənt/',
    translation: 'لا تأثير تكراري (تنفيذ العملية عدة مرات يعطي نفس النتيجة)',
    partOfSpeech: 'adjective',
    definition: 'An operation that produces the same result no matter how many times it is executed.',
    exampleSentence: 'HTTP GET, PUT, and DELETE requests are designed to be idempotent.',
    exampleTranslation: 'تم تصميم طلبات HTTP من نوع GET و PUT و DELETE لتكون متكافئة الأثر.',
    category: 'software',
    cefrLevel: 'C1'
  },
  {
    word: 'Repository',
    phonetic: '/rɪˈpɒz.ɪ.tər.i/',
    translation: 'مستودع الكود البرمجي (Git Repo)',
    partOfSpeech: 'noun',
    definition: 'A central storage location where code and version history are managed.',
    exampleSentence: 'Clone the remote Git repository before starting your feature branch.',
    exampleTranslation: 'قم باستنساخ مستودع Git البعيد قبل بدء فرع الميزة الجديد.',
    category: 'devops',
    cefrLevel: 'A2'
  },
  {
    word: 'Continuous Integration',
    phonetic: '/kənˈtɪn.ju.əs ˌɪn.tɪˈɡreɪ.ʃən/',
    translation: 'التكامل المستمر (CI: فحص الكود واختباره آلياً)',
    partOfSpeech: 'noun',
    definition: 'Automating the integration of code changes from multiple contributors into a shared project.',
    exampleSentence: 'Our CI/CD pipeline runs unit tests automatically on every pull request.',
    exampleTranslation: 'يقوم خط أنابيب CI/CD بتشغيل اختبارات الوحدة آليًا مع كل طلب سحب.',
    category: 'devops',
    cefrLevel: 'B2'
  },
  {
    word: 'Latency',
    phonetic: '/ˈleɪ.tən.si/',
    translation: 'زمن الانتقال / التأخير الزمني للشبكة',
    partOfSpeech: 'noun',
    definition: 'The time delay experienced in a system between the cause and the aspect of some physical change.',
    exampleSentence: 'Deploying edge servers close to users drastically reduces round-trip latency.',
    exampleTranslation: 'يؤدي نشر خوادم الحافة القريبة من المستخدمين إلى تقليل زمن التأخير بشكل جذري.',
    category: 'software',
    cefrLevel: 'B2'
  }
];

// =========================================================================
// 2. CONVERSATION SCENARIOS (AI ROLEPLAY & SPEAKING LAB)
// =========================================================================

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: 'tech_job_interview',
    title: 'Software Developer Job Interview',
    titleAr: 'مقابلة عمل لمطور برمجيات (Tech Job Interview)',
    description: 'Practice answering technical and behavioral interview questions with a Senior Engineering Manager.',
    descriptionAr: 'تدرب على أسئلة المقابلة التقنية والشخصية مع مدير هندسي أول باللغة الإنجليزية.',
    category: 'coding_interview',
    icon: 'Briefcase',
    targetCefr: 'B2',
    systemPersona: 'You are Alex, a friendly but professional Senior Engineering Director interviewing a candidate for a Full-Stack Software Developer role. Ask concise, realistic technical and behavioral questions one by one. Evaluate their confidence, technical accuracy, and English fluency.',
    initialMessage: "Welcome to our technical interview! To start off, could you briefly introduce yourself and describe a recent challenging programming project you worked on?",
    suggestedPhrases: [
      "I specialize in full-stack development using React and Node.js.",
      "The main challenge was handling state management and real-time synchronization.",
      "We optimized performance by caching query responses in Redis.",
      "I worked closely with cross-functional teams to deliver on time."
    ],
    keyVocabulary: ['Architecture', 'Refactoring', 'Scalability', 'Debugging', 'Deployment', 'Optimization'],
    grammarFocus: 'Past Simple & Present Perfect for describing achievements and experience.'
  },
  {
    id: 'project_pitch',
    title: 'Technical Project Presentation',
    titleAr: 'عرض مشروع تقني أمام عميل أو مستثمر (Project Pitch)',
    description: 'Explain your software system, architectural benefits, and impact clearly to stakeholders.',
    descriptionAr: 'اشرح هيكل مشروعك البرمجي، مميزاته، وقيمته المضافة بالإنجليزية أمام فريق العمل أو العملاء.',
    category: 'project_pitch',
    icon: 'Presentation',
    targetCefr: 'B2',
    systemPersona: 'You are Sarah, a Lead Product Strategist. You are listening to the developer present their software project. Ask clarifying questions about system scalability, user experience, and roadmap milestones.',
    initialMessage: "Good morning! We're excited to see your presentation today. Please walk us through the core problem your application solves and your architectural decisions.",
    suggestedPhrases: [
      "Our platform addresses the problem of educational fragmentation by integrating all tools.",
      "From an architectural standpoint, we chose a modular microservices approach.",
      "This solution reduces administrative overhead by over 40 percent.",
      "Let me demonstrate how the AI model routes queries dynamically."
    ],
    keyVocabulary: ['Value Proposition', 'Return on Investment', 'Integration', 'Seamless UX', 'Benchmark'],
    grammarFocus: 'Modal verbs (can, could, should, will) and future forms for roadmaps.'
  },
  {
    id: 'coding_problem_walkthrough',
    title: 'Live Coding & System Design Discussion',
    titleAr: 'نقاش كود وحل مسائل برمجية (Coding Dialogue)',
    description: 'Discuss data structures, algorithms, time complexity, and edge cases in English.',
    descriptionAr: 'ناقش خوارزميات وهياكل البيانات والتعقيد الزمني وكيفية معالجة الحالات الخاصة بالإنجليزية.',
    category: 'tech_meeting',
    icon: 'Code',
    targetCefr: 'B1',
    systemPersona: 'You are David, a friendly Staff Engineer conducting a pair-programming system design session. Guide the candidate gently and ask how they would handle edge cases.',
    initialMessage: "Hi there! Let's discuss an algorithm to detect duplicates in a large dataset. What data structure would you choose first, and what would be its time complexity?",
    suggestedPhrases: [
      "I would use a Hash Set because lookup time is on average O(1).",
      "We need to consider edge cases such as empty input or memory constraints.",
      "If memory is constrained, sorting first might be preferable.",
      "Let's write a unit test to verify this behavior."
    ],
    keyVocabulary: ['Hash Map', 'Time Complexity', 'Space Overhead', 'Edge Case', 'Iterative', 'Binary Tree'],
    grammarFocus: 'Conditional Sentences (If clause type 1 and 2).'
  },
  {
    id: 'client_support_consulting',
    title: 'Technical Support & Client Consulting',
    titleAr: 'استشارات تقنية ودعم العملاء (Client Support)',
    description: 'Communicate politely with international clients, troubleshoot issues, and propose solutions.',
    descriptionAr: 'تواصل بلباقة مع عملاء أجانب، شخص المشاكل التقنية واقترح حلولاً عملية واضحة.',
    category: 'client_support',
    icon: 'Headphones',
    targetCefr: 'B1',
    systemPersona: 'You are Emily, a client whose company web application is experiencing intermittent login timeouts. Describe your problem and listen to the developer diagnose it.',
    initialMessage: "Hello! Our team has been experiencing issues logging into the dashboard for the past two hours. It just hangs on the loading spinner. Can you help us resolve this?",
    suggestedPhrases: [
      "I completely understand your concern and I'm looking into it right away.",
      "Could you please check your browser network tab for any 500 error codes?",
      "We are currently rolling out a hotfix to patch the database connection pool.",
      "Thank you for your patience while we verify the fix on our staging environment."
    ],
    keyVocabulary: ['Troubleshooting', 'Intermittent', 'Hotfix', 'Root Cause', 'Downtime', 'Resolution'],
    grammarFocus: 'Polite requests and passive voice in technical reporting.'
  },
  {
    id: 'airport_and_travel',
    title: 'International Travel & Airport Navigation',
    titleAr: 'السفر والمطارات الدولية (Airport & Travel)',
    description: 'Master practical conversations at check-in, customs, flight connections, and hotels.',
    descriptionAr: 'تدرب على محادثات السفر الحقيقية في المطار، الجوازات، حجز الفنادق، وطلب المساعدة.',
    category: 'travel',
    icon: 'Plane',
    targetCefr: 'A2',
    systemPersona: 'You are Michael, an immigration officer and airport gate manager. Interact politely with the traveler.',
    initialMessage: "Good day! Welcome to Terminal 3. May I see your passport, boarding pass, and visa documents, please?",
    suggestedPhrases: [
      "Here is my passport and electronic boarding pass.",
      "I am traveling to London for a tech conference for one week.",
      "Could you please tell me which gate my connecting flight departs from?",
      "I have only one carry-on bag and no items to declare."
    ],
    keyVocabulary: ['Boarding Pass', 'Baggage Claim', 'Customs', 'Departure Gate', 'Connecting Flight'],
    grammarFocus: 'Present Simple, polite questions with May/Could/Would.'
  },
  {
    id: 'daily_fluency_chat',
    title: 'Daily Casual Life & Socializing',
    titleAr: 'محادثة اجتماعية ويومية عامة (Daily Fluency)',
    description: 'Speak naturally about hobbies, current tech trends, productivity habits, and goals.',
    descriptionAr: 'تحدث بطلاقة وعفوية عن روتينك اليومي، أهدافك، أحدث التقنيات وعاداتك في الإنتاجية.',
    category: 'daily',
    icon: 'MessageCircle',
    targetCefr: 'A2',
    systemPersona: 'You are Jordan, a friendly peer student in an international coding bootcamp. Chat casually and warmly.',
    initialMessage: "Hey! How has your study week been going so far? Are you working on any exciting side projects lately?",
    suggestedPhrases: [
      "It has been pretty busy but rewarding! I'm learning React hooks.",
      "In my free time, I enjoy reading about artificial intelligence.",
      "I try to practice coding and English for at least an hour every morning.",
      "What about you? What framework do you like the most?"
    ],
    keyVocabulary: ['Routine', 'Productive', 'Side Project', 'Consistency', 'Collaborate'],
    grammarFocus: 'Present Continuous vs Present Simple and frequency adverbs.'
  }
];

// =========================================================================
// 3. DIAGNOSTIC PLACEMENT TEST QUESTIONS (A1 - C2 PLACEMENT)
// =========================================================================

export interface DiagnosticItem {
  id: string;
  cefrLevel: CefrLevel;
  skill: LanguageSkill;
  questionText: string;
  contextText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticItem[] = [
  // A1 Level Questions
  {
    id: 'diag_a1_1',
    cefrLevel: 'A1',
    skill: 'grammar',
    questionText: 'Choose the correct form: She _____ a software developer at Nagah Center.',
    options: ['am', 'is', 'are', 'be'],
    correctIndex: 1,
    explanation: 'Subject "She" takes the singular verb "is" in the present simple.'
  },
  {
    id: 'diag_a1_2',
    cefrLevel: 'A1',
    skill: 'vocabulary',
    questionText: 'Which word means the device you use to type code on a computer?',
    options: ['Monitor', 'Keyboard', 'Speaker', 'Printer'],
    correctIndex: 1,
    explanation: 'A keyboard is the primary input hardware used for typing.'
  },
  // A2 Level Questions
  {
    id: 'diag_a2_1',
    cefrLevel: 'A2',
    skill: 'grammar',
    questionText: 'Yesterday, our trainer _____ us how to create a responsive website.',
    options: ['teach', 'taught', 'teaching', 'teaches'],
    correctIndex: 1,
    explanation: '"Yesterday" signals the past simple tense, so the irregular past of "teach" is "taught".'
  },
  {
    id: 'diag_a2_2',
    cefrLevel: 'A2',
    skill: 'listening',
    questionText: 'In a tech team meeting, the manager says: "Please push your commits before 5 PM." What does the manager want?',
    options: ['Turn off the computers early', 'Upload your latest code changes', 'Delete your project files', 'Send an email to the client'],
    correctIndex: 1,
    explanation: '"Push commits" means uploading saved code changes to the remote repository.'
  },
  // B1 Level Questions
  {
    id: 'diag_b1_1',
    cefrLevel: 'B1',
    skill: 'grammar',
    questionText: 'If we _____ the database query, the application will load much faster.',
    options: ['optimize', 'optimized', 'will optimize', 'optimizing'],
    correctIndex: 0,
    explanation: 'In the First Conditional (real present/future), the IF clause uses the Present Simple.'
  },
  {
    id: 'diag_b1_2',
    cefrLevel: 'B1',
    skill: 'reading',
    questionText: 'Read the sentence: "The API endpoint has been deprecated in favor of a GraphQL service." What does this mean?',
    options: [
      'The API is now faster than GraphQL',
      'The old API is being replaced and shouldn\'t be used for new development',
      'The server has crashed permanently',
      'GraphQL was completely cancelled'
    ],
    correctIndex: 1,
    explanation: '"Deprecated" means phased out or discouraged from use in favor of a newer alternative.'
  },
  // B2 Level Questions
  {
    id: 'diag_b2_1',
    cefrLevel: 'B2',
    skill: 'grammar',
    questionText: 'By the time the product launches next month, the engineering team _____ all critical vulnerabilities.',
    options: ['will fix', 'had fixed', 'will have fixed', 'fixes'],
    correctIndex: 2,
    explanation: '"By the time + future clause" requires the Future Perfect ("will have fixed").'
  },
  {
    id: 'diag_b2_2',
    cefrLevel: 'B2',
    skill: 'vocabulary',
    questionText: 'Which word best completes the sentence: "To ensure high availability, the server cluster was designed with full _____."',
    options: ['redundancy', 'reluctance', 'recurrence', 'resemblance'],
    correctIndex: 0,
    explanation: 'Redundancy in systems engineering means having duplicate components to prevent single points of failure.'
  },
  // C1 Level Questions
  {
    id: 'diag_c1_1',
    cefrLevel: 'C1',
    skill: 'grammar',
    questionText: 'Seldom _____ such an elegant solution to a distributed consensus problem in computer science.',
    options: ['we have seen', 'have we seen', 'we saw', 'did we saw'],
    correctIndex: 1,
    explanation: 'Negative/restrictive adverbs like "Seldom" at the start of a clause trigger subject-auxiliary inversion ("have we seen").'
  },
  {
    id: 'diag_c1_2',
    cefrLevel: 'C1',
    skill: 'reading',
    questionText: 'What is the implied nuance: "The architect was ostensibly satisfied with the throughput, yet insisted on further refactoring."?',
    options: [
      'The architect was thoroughly overjoyed with no remaining doubts',
      'The architect appeared pleased on the surface, but retained underlying reservations',
      'The throughput had failed entirely',
      'Refactoring was deemed impossible'
    ],
    correctIndex: 1,
    explanation: '"Ostensibly" means appearing or claiming to be one thing while having hidden nuances.'
  }
];

// =========================================================================
// 4. LEITNER 5-BOX SPACED REPETITION LOGIC
// =========================================================================

export class LeitnerSpacedRepetition {
  /**
   * Promotes card to next Leitner box on correct answer (up to Box 5).
   */
  static handleCorrect(card: VocabularyCard): VocabularyCard {
    const nextBox = Math.min(5, card.leitnerBox + 1) as 1 | 2 | 3 | 4 | 5;
    const daysToAdd = this.getIntervalDays(nextBox);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return {
      ...card,
      leitnerBox: nextBox,
      timesCorrect: card.timesCorrect + 1,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: nextDate.toISOString()
    };
  }

  /**
   * Demotes card back to Box 1 for immediate reinforcement upon error.
   */
  static handleWrong(card: VocabularyCard): VocabularyCard {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1); // review tomorrow

    return {
      ...card,
      leitnerBox: 1,
      timesWrong: card.timesWrong + 1,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: nextDate.toISOString()
    };
  }

  /**
   * Spaced interval in days for each Leitner Box:
   * Box 1: 1 day (Every day)
   * Box 2: 3 days
   * Box 3: 7 days (Weekly)
   * Box 4: 14 days (Bi-weekly)
   * Box 5: 30 days (Monthly / Mastered)
   */
  static getIntervalDays(box: 1 | 2 | 3 | 4 | 5): number {
    switch (box) {
      case 1: return 1;
      case 2: return 3;
      case 3: return 7;
      case 4: return 14;
      case 5: return 30;
      default: return 1;
    }
  }

  /**
   * Filters cards that are due for review today.
   */
  static getDueCards(cards: VocabularyCard[]): VocabularyCard[] {
    const now = new Date();
    return cards.filter(card => {
      if (!card.nextReviewDate) return true;
      return new Date(card.nextReviewDate) <= now;
    });
  }
}

// =========================================================================
// 5. WEB SPEECH & AUDIO SYNTHESIS HELPER
// =========================================================================

export class SpeechAudioEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  static speak(text: string, options?: { rate?: number; pitch?: number; lang?: string; onEnd?: () => void }): void {
    if (!this.synth) return;
    this.synth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate || 0.95;
    utterance.pitch = options?.pitch || 1.0;

    // Pick natural English voice if available
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }

    this.synth.speak(utterance);
  }

  static stop(): void {
    if (this.synth) this.synth.cancel();
  }

  /**
   * Initializes browser SpeechRecognition if supported.
   */
  static createSpeechRecognizer(onResult: (transcript: string, isFinal: boolean) => void, onError: (err: any) => void): any | null {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onResult(final || interim, Boolean(final));
    };

    recognition.onerror = onError;
    return recognition;
  }
}

// =========================================================================
// 6. DEFAULT USER PROFILE FACTORY & STORAGE
// =========================================================================

export function createInitialLanguageProfile(studentId: string, studentName: string, studentCode?: string, groupId?: string, groupName?: string): LanguageUserProfile {
  const seedFlashcards: VocabularyCard[] = TECHNICAL_VOCABULARY_SEED.map((seed, index) => ({
    ...seed,
    id: `card_${studentId}_${index + 1}`,
    leitnerBox: 1,
    timesCorrect: 0,
    timesWrong: 0
  }));

  return {
    studentId,
    studentName,
    studentCode: studentCode || '',
    groupId: groupId || '',
    groupName: groupName || '',
    currentLevel: 'A1',
    isDiagnosticCompleted: false,
    diagnosticHistory: [],
    scores: {
      speaking: 60,
      listening: 65,
      reading: 70,
      writing: 55,
      vocabulary: 60,
      grammar: 58,
      pronunciation: 62,
      overall: 61
    },
    wordsLearnedCount: 15,
    totalPracticeMinutes: 25,
    streakDays: 3,
    lastPracticeDate: new Date().toISOString(),
    xpPoints: 350,
    starsCount: 12,
    unlockedBadges: ['first_step', 'tech_vocab_novice'],
    dailyChallengeCompleted: false,
    weeklyChallengeCompleted: false,
    flashcards: seedFlashcards,
    needsImprovementSkills: ['speaking', 'writing', 'grammar'],
    strengthsSkills: ['reading', 'listening'],
    updatedAt: new Date().toISOString()
  };
}

export const LANGUAGE_STORAGE_KEY_PREFIX = 'nagah_lang_profile_';

export function getCachedStudentProfile(studentId: string): LanguageUserProfile | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`${LANGUAGE_STORAGE_KEY_PREFIX}${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading language profile cache:', e);
  }
  return null;
}

export function saveCachedStudentProfile(profile: LanguageUserProfile): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${LANGUAGE_STORAGE_KEY_PREFIX}${profile.studentId}`, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving language profile cache:', e);
  }
}
