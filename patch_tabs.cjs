const fs = require('fs');
let code = fs.readFileSync('src/features/language-lab/LanguageLabView.tsx', 'utf8');

// Replace the inline tabs array
const oldTabs = `        {[
          { id: 'PRONUNCIATION', label: 'معمل النطق', icon: Mic },
          { id: 'FLASHCARDS', label: 'المفردات', icon: BookOpen },
          { id: 'CONVERSATION_AI', label: 'المحادثة', icon: MessageSquare },
          { id: 'PLACEMENT_TEST', label: 'اختبار المستوى', icon: Award },
        ].map(tab => {`;

const newTabs = `        {[
          { id: 'VIDEO_LESSONS', label: 'فيديوهات وتدريب مهارات التحدث', icon: Youtube },
          { id: 'INTERNATIONAL_EXAMS', label: 'الاختبارات الدولية', icon: GraduationCap },
          { id: 'PRONUNCIATION', label: 'معمل النطق', icon: Mic },
          { id: 'FLASHCARDS', label: 'المفردات', icon: BookOpen },
          { id: 'CONVERSATION_AI', label: 'المحادثة', icon: MessageSquare },
          { id: 'PLACEMENT_TEST', label: 'اختبار المستوى', icon: Award },
        ].map(tab => {`;

code = code.replace(oldTabs, newTabs);

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
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-black text-white">فيديوهات ومحاضرات مهارات التحدث</h2>
            <p className="text-sm text-slate-400">ستظهر هنا الفيديوهات التعليمية والمحاضرات الخاصة بتطوير مهارة التحدث التي سيتم رفعها قريباً.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 group cursor-pointer hover:border-red-500/50 transition-colors">
                <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                  <Youtube className="w-12 h-12 text-slate-600 group-hover:text-red-500 transition-colors" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">10:45</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-sm mb-1" dir="ltr">Speaking Masterclass Part {i}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2" dir="ltr">Learn how to speak fluently and accurately with proper intonation and pronunciation.</p>
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
            <h2 className="text-2xl font-black text-white">محاكاة الاختبارات الدولية المعتمدة</h2>
            <p className="text-sm text-slate-400">تدرب على بيئة الاختبار الحقيقية لاختبارات التوفل والآيلتس وكامبريدج مع التصحيح الآلي للأسئلة ومهارة التحدث بالذكاء الاصطناعي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-violet-500 transition-colors cursor-pointer group">
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-violet-400">IELTS</h3>
              <p className="text-xs text-slate-400 mb-6 h-12">Academic & General Training. Full mock tests for Reading, Listening, Writing, and Speaking.</p>
              <button className="w-full py-3 bg-violet-600/20 text-violet-400 rounded-xl font-bold text-sm group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">ابدأ المحاكاة الآن</button>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer group">
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-blue-400">TOEFL iBT</h3>
              <p className="text-xs text-slate-400 mb-6 h-12">Experience the official format with AI-scored speaking and writing sections.</p>
              <button className="w-full py-3 bg-blue-600/20 text-blue-400 rounded-xl font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">ابدأ المحاكاة الآن</button>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer group">
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-emerald-400">Cambridge</h3>
              <p className="text-xs text-slate-400 mb-6 h-12">B2 First (FCE) and C1 Advanced (CAE) comprehensive preparation modules.</p>
              <button className="w-full py-3 bg-emerald-600/20 text-emerald-400 rounded-xl font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">ابدأ المحاكاة الآن</button>
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
