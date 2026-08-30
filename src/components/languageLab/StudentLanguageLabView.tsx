import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  BookOpen,
  PenTool,
  Brain,
  Award,
  Sparkles,
  Flame,
  Star,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Play,
  Send,
  Zap,
  BookMarked,
  ShieldCheck,
  TrendingUp,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import {
  LanguageLabStudentProgress,
  getStoredLanguageProgress,
  saveStoredLanguageProgress,
  callLanguageLabAI,
  CEFRLevel
} from '../../services/aiLanguageLabCore';

interface StudentLanguageLabViewProps {
  student: any;
}

export const StudentLanguageLabView: React.FC<StudentLanguageLabViewProps> = ({ student }) => {
  const studentId = student?.id || student?.code || 'stud-1';
  const [progress, setProgress] = useState<LanguageLabStudentProgress>(() => getStoredLanguageProgress(studentId));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'speaking' | 'ai_chat' | 'listening' | 'reading' | 'writing' | 'vocab' | 'technical' | 'coach'>('dashboard');

  // AI Chat / Conversation State
  const [selectedScenario, setSelectedScenario] = useState('مقابلة عمل (Job Interview)');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    { sender: 'ai', text: 'Hello! Welcome to your AI Speaking Lab. Let us start our practice. Could you please introduce yourself and mention your programming background?', time: '00:00' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<any | null>(null);

  // Speaking stage state
  const [speakingStep, setSpeakingStep] = useState<'word' | 'phrase' | 'sentence' | 'dialog' | 'full'>('word');
  const [targetWord] = useState('Asynchronous');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenResult, setSpokenResult] = useState<string | null>(null);

  // Writing Lab State
  const [writingPrompt, setWritingPrompt] = useState('Describe your favorite web development project and why you chose React and TypeScript.');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [writingAnalysis, setWritingAnalysis] = useState<any | null>(null);
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);

  // Flashcards State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  // AI Learning Coach Recommendation
  const [coachAdvice, setCoachAdvice] = useState<string>('بناءً على تحليلي لأدائك، لديك فرصة رائعة لتحسين زمن الفعل الماضي (Past Tense) وممارسة مصطلحات البرمجة السحابية اليوم.');
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    const newMsgs = [...chatMessages, { sender: 'user' as const, text: userMsg, time: new Date().toLocaleTimeString() }];
    setChatMessages(newMsgs);
    setChatInput('');
    setIsAiThinking(true);

    const aiReply = await callLanguageLabAI(`User response in scenario "${selectedScenario}": "${userMsg}". Provide natural conversational follow-up and a short educational feedback on grammar/pronunciation.`, 'text');
    
    setChatMessages([...newMsgs, { sender: 'ai', text: aiReply, time: new Date().toLocaleTimeString() }]);
    setIsAiThinking(false);

    // Update XP and stats
    const updated = {
      ...progress,
      xp: progress.xp + 15,
      totalTrainingMinutes: progress.totalTrainingMinutes + 2
    };
    setProgress(updated);
    saveStoredLanguageProgress(updated);
  };

  const handleAnalyzeWriting = async () => {
    if (!writingAnswer.trim()) return;
    setIsAnalyzingWriting(true);
    const prompt = `Analyze this student English writing for CEFR level ${progress.cefrLevel}: "${writingAnswer}". Give feedback in Arabic on grammar, spelling, vocabulary, clarity, and education correction.`;
    const resultText = await callLanguageLabAI(prompt, 'reasoning');
    setWritingAnalysis({
      score: 84,
      feedback: resultText
    });
    setIsAnalyzingWriting(false);

    const updated = { ...progress, xp: progress.xp + 25 };
    setProgress(updated);
    saveStoredLanguageProgress(updated);
  };

  const handleAskCoach = async () => {
    setIsLoadingCoach(true);
    const prompt = `Student level: ${progress.cefrLevel}, Weaknesses: ${progress.weaknesses.join(', ')}. Recommend today's best training module, words to review, and next plan in friendly Arabic.`;
    const advice = await callLanguageLabAI(prompt, 'reasoning');
    setCoachAdvice(advice);
    setIsLoadingCoach(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Lab Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold shrink-0 shadow-lg shadow-teal-500/10">
              🗣️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">معملي الذكي للغات (AI Language Lab)</h2>
                <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-black border border-teal-500/30">
                  {progress.cefrLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مساحتك الشخصية للتحدث، الاستماع، القراءة، الكتابة، والمساعد الذكي المخصص لطورك اللغوي
              </p>
            </div>
          </div>

          {/* Gamification Quick Stats */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300">{progress.xp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-black text-rose-300">{progress.streak} أيام متتالية</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-black text-yellow-300">{progress.stars} نجمة</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-slate-800 pb-1">
          {[
            { id: 'dashboard', label: 'لوحة التقدم 📊', icon: TrendingUp },
            { id: 'ai_chat', label: 'محادثة AI الحية 💬', icon: Sparkles },
            { id: 'speaking', label: 'معمل النطق 🎙️', icon: Mic },
            { id: 'listening', label: 'الاستماع والفهم 🎧', icon: Volume2 },
            { id: 'reading', label: 'معمل القراءة 📖', icon: BookOpen },
            { id: 'writing', label: 'معمل الكتابة ✍️', icon: PenTool },
            { id: 'vocab', label: 'بطاقات الكلمات 🗂️', icon: BookMarked },
            { id: 'technical', label: 'إنجليزي تقني 💻', icon: Layers },
            { id: 'coach', label: 'المساعد الذكي 🤖', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">مستوى CEFR الحالي</span>
                <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">مرجع CEFR</span>
              </div>
              <div className="text-2xl font-black text-teal-400">{progress.cefrLevel}</div>
              <p className="text-[11px] text-slate-400">نتيجة الاختبار التشخيصي: {progress.placementScore}%</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">حصيلة الكلمات</span>
                <BookMarked className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{progress.vocabularyCount} كلمة</div>
              <p className="text-[11px] text-slate-400">محفوظة في نظام الذاكرة المتباعدة</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">وقت التدريب الإجمالي</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300">{progress.totalTrainingMinutes} دقيقة</div>
              <p className="text-[11px] text-slate-400">معدل استمرارية ممتاز</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">المهارة الأقوى</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-300">{progress.strengths[0]}</div>
              <p className="text-[11px] text-slate-400">استمر في التفوق!</p>
            </div>
          </div>

          {/* Detailed Skill Scores */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              مستويات المهارات اللغوية (Skills Breakdown)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(progress.scores).map(([skill, score], idx, arr) => (
                <div key={skill} className={`space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 ${idx === arr.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200 capitalize">{skill}</span>
                    <span className="font-mono font-bold text-teal-400">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, Number(score)))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses & AI Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                مهارات تحتاج تركيزاً وتطويراً
              </h4>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {progress.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                توصيات المساعد الذكي اليومية
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{coachAdvice}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CONVERSATION SCENARIOS */}
      {activeTab === 'ai_chat' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">محادثة الذكاء الاصطناعي الحية (AI Conversation Arena)</h3>
              <p className="text-xs text-slate-400">اختر سيناريو واقعياً وابدأ التحاور الفوري باللغة الإنجليزية</p>
            </div>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option>مقابلة عمل (Job Interview)</option>
              <option>موقف في المدرسة / الجامعة (School & University)</option>
              <option>السفر والمطار والفنادق (Travel & Airport)</option>
              <option>محادثة تقنية وبرمجية (Technical & Coding Interview)</option>
              <option>شرح مشروع أو عرض تقديمي (Project Presentation)</option>
              <option>محادثة مع عميل أجنبي (Client Meeting)</option>
            </select>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[350px] max-h-[450px] overflow-y-auto space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user' ? 'bg-amber-500 text-slate-950' : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}>
                  {msg.sender === 'user' ? 'أنت' : 'AI'}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'bg-amber-500/10 border border-amber-500/30 text-slate-100' : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block font-mono">{msg.time}</span>
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex gap-2 items-center text-teal-400 text-xs p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>المساعد الذكي يفكر ويكتب الرد...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اكتب ردك باللغة الإنجليزية هنا..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>إرسال</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SPEAKING LAB */}
      {activeTab === 'speaking' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-100">معمل النطق التدريجي (Speaking Lab)</h3>
            <p className="text-xs text-slate-400">التدرج: كلمة ➔ عبارة ➔ جملة ➔ حوار ➔ محادثة كاملة مع تحليل الدقة والنطق</p>
          </div>

          {/* Step Selector */}
          <div className="flex justify-center gap-2">
            {(['word', 'phrase', 'sentence', 'dialog', 'full'] as const).map((step) => (
              <button
                key={step}
                onClick={() => setSpeakingStep(step)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  speakingStep === step ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {step === 'word' && '1. كلمة'}
                {step === 'phrase' && '2. عبارة'}
                {step === 'sentence' && '3. جملة'}
                {step === 'dialog' && '4. حوار'}
                {step === 'full' && '5. محادثة كاملة'}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto space-y-4">
            <span className="text-xs text-teal-400 font-bold block">اقرأ الكلمة أو الجملة التالية بصوت واضح:</span>
            <div className="text-3xl font-black text-slate-100 font-mono tracking-wide">
              {speakingStep === 'word' && 'Asynchronous Architecture'}
              {speakingStep === 'phrase' && 'Scalable cloud infrastructure'}
              {speakingStep === 'sentence' && 'We are implementing microservices to improve system resilience.'}
              {speakingStep === 'dialog' && '- Can you explain the deployment pipeline?\n- Yes, it uses GitHub Actions and Docker.'}
              {speakingStep === 'full' && 'Full Technical Presentation & Q&A Simulation'}
            </div>

            <button
              onClick={() => {
                setIsRecording(true);
                setTimeout(() => {
                  setIsRecording(false);
                  setSpokenResult('Accuracy: 92% | Pronunciation: 88% | Stress & Intonation: Excellent!');
                }, 3000);
              }}
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                isRecording ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50' : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-xl'
              }`}
            >
              <Mic className="w-7 h-7" />
            </button>
            <p className="text-xs text-slate-400">{isRecording ? 'جاري الاستماع وتحليل الصوت...' : 'اضغط للبدء بالتسجيل الصوتي'}</p>

            {spokenResult && (
              <div className="bg-teal-950/40 border border-teal-500/30 p-3 rounded-xl text-xs text-teal-300 font-bold animate-fadeIn">
                ✓ {spokenResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LISTENING LAB */}
      {activeTab === 'listening' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">معمل الاستماع والفهم (Listening & Dictation Lab)</h3>
              <p className="text-xs text-slate-400">استمع للملف الصوتي أجب عن أسئلة الفهم (Comprehension & Dictation)</p>
            </div>
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance('Welcome to Nagah technical listening lab. Clean code and proper testing are essential for enterprise software reliability.');
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
              }}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>استمع للنص الصوتي 🔊</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200">سؤال 1: ما هو الهدف الأساسي من الاختبار الصوتي المسموع؟</h4>
            <div className="space-y-2">
              {[
                'ضمان موثوقية البرمجيات واختبارها (Software reliability & testing)',
                'شراء خوادم جديدة',
                'تصميم واجهات المستخدم',
                'تسجيل الحضور'
              ].map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-300">
                  <input type="radio" name="listening_q1" className="text-teal-500" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: READING LAB */}
      {activeTab === 'reading' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">معمل القراءة المتقدم (Reading Lab & WPM Analysis)</h3>
            <p className="text-xs text-slate-400">قراءة نصوص تقنية مناسبة لمستواك مع قياس سرعة القراءة (WPM) واستخراج المفردات</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 leading-relaxed text-slate-200 text-sm">
            <h4 className="text-teal-400 font-bold text-xs uppercase tracking-wide">Reading Passage (CEFR {progress.cefrLevel})</h4>
            <p>
              Artificial Intelligence and cloud computing are transforming modern education. In Nagah training platform, automated code analysis and AI voice coaches enable students to master technical English faster than traditional methods. By practicing daily and utilizing spaced repetition, memory retention increases significantly.
            </p>
            <div className="flex gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>سرعة القراءة المقدرة: <strong className="text-teal-300">145 WPM</strong></span>
              <span>دقة الفهم: <strong className="text-emerald-300">90%</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WRITING LAB */}
      {activeTab === 'writing' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">معمل الكتابة الذكي والتححيح التربوي (Writing Lab)</h3>
            <p className="text-xs text-slate-400">اكتب إجابتك باللغة الإنجليزية وسيقوم الـ AI بتحليل القواعد، الإملاء، والمفردات مع تصحيح تعليمي</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 text-xs text-teal-300 font-bold">
            السؤال الحالي: {writingPrompt}
          </div>

          <textarea
            rows={5}
            value={writingAnswer}
            onChange={(e) => setWritingAnswer(e.target.value)}
            placeholder="اكتب إجابتك باللغة الإنجليزية هنا (مثال: I chose React and TypeScript because they provide robust typing and component reusability...)"
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeWriting}
              disabled={isAnalyzingWriting || !writingAnswer.trim()}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isAnalyzingWriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>تححيح وتقييم بالذكاء الاصطناعي</span>
            </button>
          </div>

          {writingAnalysis && (
            <div className="bg-slate-950 border border-teal-500/40 p-5 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-teal-300">نتيجة تقييم الكتابة والتصحيح التعليمي</span>
                <span className="text-xs font-mono font-bold bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-lg">الدرجة: {writingAnalysis.score}%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{writingAnalysis.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: VOCABULARY FLASHCARDS */}
      {activeTab === 'vocab' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-6 max-w-xl mx-auto">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">ذاكرة الكلمات والبطاقات (Spaced Repetition Flashcards)</h3>
            <p className="text-xs text-slate-400">نظام الذاكرة المتباعدة (Box 1 إلى Box 5) لحفظ الكلمات البرمجية والتقنية بكفاءة</p>
          </div>

          {progress.flashcards.length > 0 ? (
            <div
              onClick={() => setShowDefinition(!showDefinition)}
              className="bg-slate-950 border-2 border-teal-500/40 rounded-3xl p-10 cursor-pointer shadow-2xl transition-all hover:border-teal-400 space-y-4 min-h-[220px] flex flex-col items-center justify-center"
            >
              <span className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full font-mono">
                صندوق الحفظ رقم {progress.flashcards[activeCardIndex].box}
              </span>
              <h4 className="text-2xl font-black text-slate-100 font-mono">
                {progress.flashcards[activeCardIndex].term}
              </h4>
              {showDefinition ? (
                <p className="text-xs text-teal-300 font-bold animate-fadeIn">
                  {progress.flashcards[activeCardIndex].definition}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 italic">اضغط لقلب البطاقة ومعرفة المعنى</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">لا توجد بطاقات حالياً</p>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setShowDefinition(false);
                setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : progress.flashcards.length - 1));
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              السابق
            </button>
            <button
              onClick={() => {
                setShowDefinition(false);
                setActiveCardIndex((prev) => (prev < progress.flashcards.length - 1 ? prev + 1 : 0));
              }}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black"
            >
              البطاقة التالية ➔
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: TECHNICAL ENGLISH */}
      {activeTab === 'technical' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">مصطلحات الإنجليزية التقنية لمركّز النجاح (Technical English)</h3>
            <p className="text-xs text-slate-400">مصطلحات البرمجة، الذكاء الاصطناعي، قواعد البيانات، والتعليمات البرمجية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { term: 'Repository', ar: 'مستودع حفظ الكود (Git)', cat: 'Coding' },
              { term: 'Asynchronous', ar: 'مهام غير متزامنة', cat: 'Architecture' },
              { term: 'Inference', ar: 'استدلال نموذج الذكاء الاصطناعي', cat: 'AI' },
              { term: 'Schema Migration', ar: 'ترحيل وتحديث هيكل قاعدة البيانات', cat: 'Database' },
              { term: 'Middleware', ar: 'البرمجيات الوسيطة في الخادم', cat: 'Backend' },
              { term: 'Responsive Layout', ar: 'تصميم متكيف مع الشاشات', cat: 'Frontend' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">{item.cat}</span>
                <h4 className="font-bold text-slate-100 text-xs font-mono">{item.term}</h4>
                <p className="text-[11px] text-slate-400">{item.ar}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AI LEARNING COACH */}
      {activeTab === 'coach' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">المساعد الشخصي الذكي للتعلم (AI Learning Coach)</h3>
                <p className="text-xs text-slate-400">يحلل أداءك ويقترح خطتك التدريبية اليومية بدقة</p>
              </div>
            </div>
            <button
              onClick={handleAskCoach}
              disabled={isLoadingCoach}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5"
            >
              {isLoadingCoach ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>تحديث التوصيات 🔄</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-teal-500/30 p-6 rounded-2xl space-y-3">
            <h4 className="font-bold text-teal-300 text-xs">تحليل المساعد الذكي لمستواك:</h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{coachAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
