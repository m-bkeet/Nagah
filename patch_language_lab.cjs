const fs = require('fs');
let code = fs.readFileSync('src/features/language-lab/LanguageLabView.tsx', 'utf8');

// Update Tabs
if (!code.includes('TABS = [')) {
  console.log("Could not find TABS");
} else {
  // Let's add INTERNATIONAL_EXAMS and VIDEO_LESSONS to tabs
  const newTabs = `
  const TABS = [
    { id: 'VIDEO_LESSONS', icon: Youtube, label: 'محاضرات وتدريب التحدث' },
    { id: 'CONVERSATION_AI', icon: Mic, label: 'التحدث مع الذكاء الاصطناعي' },
    { id: 'INTERNATIONAL_EXAMS', icon: GraduationCap, label: 'الاختبارات الدولية (IELTS/TOEFL)' },
    { id: 'PRONUNCIATION', icon: Volume2, label: 'معمل النطق (Phonetics)' },
    { id: 'FLASHCARDS', icon: BrainCircuit, label: 'بنك الكلمات الذكي (Spaced Repetition)' },
    { id: 'PLACEMENT_TEST', icon: Award, label: 'تحديد المستوى (CEFR)' },
  ];
`;

  code = code.replace(/const TABS = \[.*?\];/s, newTabs);
  
  // Add imports if missing
  if (!code.includes('Youtube')) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, Youtube, GraduationCap } from 'lucide-react';");
  }

  // Add Video Lessons Tab content
  const videoContent = `
      {/* ========================================================================= */}
      {/* 1. VIDEO LESSONS */}
      {/* ========================================================================= */}
      {activeSkill === 'VIDEO_LESSONS' && (
        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-xl border border-slate-700 shadow-xs p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white">محاضرات ومهارات التحدث</h2>
            <p className="text-sm text-slate-400">ستظهر هنا الفيديوهات التعليمية ومحاضرات مهارات التحدث التي سيتم رفعها قريباً.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 group cursor-pointer">
                <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                  <Youtube className="w-12 h-12 text-slate-600 group-hover:text-red-500 transition-colors" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">10:45</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-sm mb-1" dir="ltr">Speaking Masterclass Part {i}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2" dir="ltr">Learn how to speak fluently and accurately with proper intonation...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
  `;

  // Add International Exams Tab content
  const examsContent = `
      {/* ========================================================================= */}
      {/* 2. INTERNATIONAL EXAMS */}
      {/* ========================================================================= */}
      {activeSkill === 'INTERNATIONAL_EXAMS' && (
        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-xl border border-slate-700 shadow-xs p-6 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-black text-white">محاكاة الاختبارات الدولية</h2>
            <p className="text-sm text-slate-400">تدرب على بيئة الاختبار الحقيقية لاختبارات التوفل والآيلتس وكامبريدج مع التصحيح الآلي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-violet-500 transition-colors cursor-pointer group">
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-violet-400">IELTS</h3>
              <p className="text-xs text-slate-400 mb-6">Academic & General Training. Full mock tests for Reading, Listening, Writing, and Speaking.</p>
              <button className="w-full py-3 bg-violet-600/20 text-violet-400 rounded-xl font-bold text-sm group-hover:bg-violet-600 group-hover:text-white transition-all">ابدأ المحاكاة</button>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer group">
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400">TOEFL iBT</h3>
              <p className="text-xs text-slate-400 mb-6">Experience the official format with AI-scored speaking and writing sections.</p>
              <button className="w-full py-3 bg-blue-600/20 text-blue-400 rounded-xl font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">ابدأ المحاكاة</button>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer group">
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400">Cambridge English</h3>
              <p className="text-xs text-slate-400 mb-6">B2 First (FCE) and C1 Advanced (CAE) comprehensive preparation modules.</p>
              <button className="w-full py-3 bg-emerald-600/20 text-emerald-400 rounded-xl font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">ابدأ المحاكاة</button>
            </div>
          </div>
        </div>
      )}
  `;

  // Change initial state
  code = code.replace(
    /const \[activeSkill, setActiveSkill\] = useState<'PRONUNCIATION' \| 'CONVERSATION_AI' \| 'FLASHCARDS' \| 'PLACEMENT_TEST'>\('PRONUNCIATION'\);/,
    "const [activeSkill, setActiveSkill] = useState<'VIDEO_LESSONS' | 'INTERNATIONAL_EXAMS' | 'PRONUNCIATION' | 'CONVERSATION_AI' | 'FLASHCARDS' | 'PLACEMENT_TEST'>('VIDEO_LESSONS');"
  );
  
  // Inject before existing content
  code = code.replace(
    /\{\/\* ========================================================================= \*\/\}\s*\{\/\* 4\. PRONUNCIATION LAB \*\/\}/s,
    videoContent + "\n" + examsContent + "\n      {/* ========================================================================= */}\n      {/* 4. PRONUNCIATION LAB */}"
  );

  fs.writeFileSync('src/features/language-lab/LanguageLabView.tsx', code);
}
