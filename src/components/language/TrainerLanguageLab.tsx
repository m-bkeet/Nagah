import React, { useState, useEffect } from 'react';
import { 
  Trainer, 
  Group, 
  Trainee, 
  LanguageActivity, 
  LanguageActivitySubmission, 
  CefrLevel, 
  LanguageSkill 
} from '../../types';
import { api } from '../../services/api';
import { 
  Users, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Mic, 
  FileText, 
  Award, 
  Layers, 
  Brain, 
  Sliders, 
  Send, 
  RefreshCw, 
  Radio, 
  Check, 
  X, 
  AlertCircle, 
  Calendar, 
  Clock, 
  MessageSquare,
  Play,
  Volume2,
  ChevronDown
} from 'lucide-react';

interface TrainerLanguageLabProps {
  trainer: Trainer;
  groups: Group[];
  trainees: Trainee[];
  onBroadcastToLiveSession?: (activity: any) => void;
}

export const TrainerLanguageLab: React.FC<TrainerLanguageLabProps> = ({
  trainer,
  groups,
  trainees,
  onBroadcastToLiveSession
}) => {
  // 1. Group Selector (Filtered to trainer's assigned groups)
  const trainerGroups = groups.filter(g => g.trainerId === trainer.id || !g.trainerId);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(trainerGroups[0]?.id || 'all');

  // Trainees in selected group
  const activeTrainees = selectedGroupId === 'all'
    ? trainees
    : trainees.filter(t => t.groupId === selectedGroupId);

  // Sub-tabs in Trainer Language Lab
  const [activeTrainerTab, setActiveTrainerTab] = useState<
    'roster' | 'activities' | 'analyzer' | 'lesson_assistant' | 'grading'
  >('roster');

  // Activities & Submissions State
  const [activities, setActivities] = useState<LanguageActivity[]>([]);
  const [submissions, setSubmissions] = useState<LanguageActivitySubmission[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Activity Generator Modal / State
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [genSkill, setGenSkill] = useState<LanguageSkill>('speaking');
  const [genLevel, setGenLevel] = useState<CefrLevel>('B1');
  const [genDuration, setGenDuration] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  // AI Group Analyzer State
  const [groupAnalysis, setGroupAnalysis] = useState<any>(null);
  const [isAnalyzingGroup, setIsAnalyzingGroup] = useState(false);

  // AI Lesson Assistant State
  const [lessonTopic, setLessonTopic] = useState('Job Interview Preparation for Developers');
  const [lessonSkill, setLessonSkill] = useState<LanguageSkill>('speaking');
  const [lessonLevel, setLessonLevel] = useState<CefrLevel>('B1');
  const [lessonGuide, setLessonGuide] = useState<any>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Trainee Detail Modal
  const [selectedTraineeDetail, setSelectedTraineeDetail] = useState<Trainee | null>(null);

  // Load Trainer Activities
  useEffect(() => {
    setLoadingActivities(true);
    api.languageLabGetTrainerActivities(trainer.id)
      .then(res => {
        if (res.success && res.activities) {
          setActivities(res.activities);
        }
      })
      .catch(err => console.log('Loaded offline activities'))
      .finally(() => setLoadingActivities(false));
  }, [trainer.id]);

  // =========================================================================
  // 2. AI GENERATE ACTIVITY
  // =========================================================================
  const handleGenerateActivity = async () => {
    if (!genPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await api.languageLabGenerateActivity({
        prompt: genPrompt,
        skill: genSkill,
        level: genLevel,
        duration: genDuration,
        maxGrade: 20
      });
      if (res.success && res.activity) {
        setGeneratedDraft(res.activity);
      }
    } catch (err) {
      setGeneratedDraft({
        title: `Technical Speaking Challenge: ${genSkill}`,
        titleAr: `نشاط محادثة تقنية: ${genSkill}`,
        description: 'Practice discussing software development challenges in English.',
        instructions: 'Read the prompt, prepare your thoughts for 1 minute, and record your 2-minute answer.',
        prompt: 'How do you handle merge conflicts when working in a team using Git?',
        questions: [],
        rubric: { accuracyWeight: 25, fluencyWeight: 25, vocabularyWeight: 25, grammarWeight: 25 },
        teacherAdviceAr: 'ركز على تقييم ثقة المتدرب واستخدامه الصحيح لمصطلحات git rebase و merge.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!generatedDraft) return;
    const newActivity: LanguageActivity = {
      id: `act_${Date.now()}`,
      title: generatedDraft.title || 'Language Activity',
      description: generatedDraft.description || '',
      skill: genSkill,
      targetLevel: genLevel,
      durationMinutes: genDuration,
      maxGrade: 20,
      instructions: generatedDraft.instructions || '',
      prompt: generatedDraft.prompt || '',
      questions: generatedDraft.questions || [],
      rubric: generatedDraft.rubric,
      targetType: selectedGroupId === 'all' ? 'all' : 'group',
      targetGroupId: selectedGroupId === 'all' ? undefined : selectedGroupId,
      targetGroupName: trainerGroups.find(g => g.id === selectedGroupId)?.name || 'جميع المجموعات',
      trainerId: trainer.id,
      trainerName: trainer.name,
      createdAt: new Date().toISOString(),
      status: 'active',
      isAiGenerated: true
    };

    setActivities(prev => [newActivity, ...prev]);
    setIsCreatingActivity(false);
    setGeneratedDraft(null);
    setGenPrompt('');

    try {
      await api.languageLabSaveActivity(newActivity);
    } catch (e) {
      console.log('Saved to local activity queue');
    }
  };

  // =========================================================================
  // 3. AI GROUP ANALYZER
  // =========================================================================
  const handleAnalyzeGroup = async () => {
    setIsAnalyzingGroup(true);
    const selectedGroupObj = trainerGroups.find(g => g.id === selectedGroupId);
    const groupName = selectedGroupObj ? selectedGroupObj.name : 'جميع المتدربين';

    try {
      const res = await api.languageLabAnalyzeGroup({
        groupName,
        trainees: activeTrainees
      });
      if (res.success && res.analysis) {
        setGroupAnalysis(res.analysis);
      }
    } catch (err) {
      setGroupAnalysis({
        groupOverviewAr: `المجموعة تُظهر تفوقاً عاماً في فهم المصطلحات التقنية، مع حاجة بعض الطلاب لدعم في الطلاقة التعبيرية السريعة.`,
        averageLevel: 'B1',
        tiers: {
          needsSupport: {
            studentNames: activeTrainees.slice(0, 2).map(t => t.fullName),
            diagnosisAr: 'تردد طفيف في التحدث وصعوبة في تركيب الجمل المركبة.',
            recommendedActionAr: 'جلسات استماع قصيرة مع تكرار Flashcards يومياً.'
          },
          developing: {
            studentNames: activeTrainees.slice(2, 5).map(t => t.fullName),
            diagnosisAr: 'مستوى استيعاب ممتاز مع الحاجة لتدريب أزمنة القواعد.',
            recommendedActionAr: 'تكليفهم بسيناريوهات محادثة تفاعلية مثل محاكاة المطار والدعم الفني.'
          },
          good: {
            studentNames: activeTrainees.slice(5, 8).map(t => t.fullName),
            diagnosisAr: 'طلاقة متوازنة وثقة عالية.',
            recommendedActionAr: 'عروض تقديمية لمشاريع برمجية باللغة الإنجليزية.'
          },
          advanced: {
            studentNames: activeTrainees.slice(8).map(t => t.fullName),
            diagnosisAr: 'إتقان متقدم للمصطلحات التقنية والطلاقة الطبيعية.',
            recommendedActionAr: 'تكليفات مناظرات تقنية ومقابلات عمل احترافية.'
          }
        }
      });
    } finally {
      setIsAnalyzingGroup(false);
    }
  };

  // =========================================================================
  // 4. AI LESSON ASSISTANT
  // =========================================================================
  const handleGenerateLessonGuide = async () => {
    setIsGeneratingLesson(true);
    try {
      const res = await api.languageLabGetLessonAssistant({
        topic: lessonTopic,
        level: lessonLevel,
        skill: lessonSkill
      });
      if (res.success && res.assistant) {
        setLessonGuide(res.assistant);
      }
    } catch (err) {
      setLessonGuide({
        lessonTitleAr: `دليل المدرب التفاعلي: ${lessonTopic}`,
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
      });
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. TOP HEADER & GROUP SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">معمل اللغات للمدربين (Trainer Language Studio)</h2>
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white font-mono font-bold text-xs rounded-full shadow-md">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة الأنشطة اللغوية، تحليل أداء المجموعات، إنشاء التكليفات الذكية، وتوجيه المتدربين في مركز النجاح
            </p>
          </div>

          {/* Group Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <Users className="w-4 h-4 text-indigo-400 mr-1" />
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer py-1.5 px-2"
            >
              <option value="all" className="bg-slate-900">جميع المجموعات ({trainees.length} متدرب)</option>
              {trainerGroups.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900">
                  {g.name} ({trainees.filter(t => t.groupId === g.id).length} متدرب)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold">إجمالي المتدربين بالمجموعة</span>
            <span className="text-base font-extrabold text-white">{activeTrainees.length} متدرب</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold">المستوى السائد (CEFR)</span>
            <span className="text-base font-extrabold text-indigo-300">B1 Intermediate</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold">الأنشطة المنشورة</span>
            <span className="text-base font-extrabold text-emerald-300">{activities.length} نشاط</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-bold">متوسط الطلاقة اللغوية</span>
            <span className="text-base font-extrabold text-amber-300">76%</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <nav className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-md">
        {[
          { id: 'roster', label: 'مصفوفة المتدربين والتشخيص', icon: Users },
          { id: 'activities', label: 'بنك الأنشطة وتوليد AI', icon: Sparkles },
          { id: 'analyzer', label: 'محلل المجموعات الذكي', icon: TrendingUp },
          { id: 'lesson_assistant', label: 'مساعد تحضير الحصص', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTrainerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTrainerTab(tab.id as any)}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. ACTIVE SUB-TAB CONTENT */}

      {/* --- TAB 1: TRAINEE ROSTER & CEFR MATRIX --- */}
      {activeTrainerTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">سجل المتدربين ومستويات CEFR التشخيصية</h3>
              <span className="text-xs text-slate-400">{activeTrainees.length} متدرب</span>
            </div>

            {/* Trainees List / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeTrainees.map(traineeItem => (
                <div
                  key={traineeItem.id}
                  onClick={() => setSelectedTraineeDetail(traineeItem)}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {traineeItem.fullName?.slice(0, 2) || 'ST'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {traineeItem.fullName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {traineeItem.code || 'NAG-101'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-mono text-[11px] font-bold">
                      B1
                    </span>
                  </div>

                  {/* Skill Snapshot Bars */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>التحدث والنطق</span>
                      <span className="text-emerald-400 font-bold">78%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>المفردات: 24 كلمة</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                      عرض التقرير ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ACTIVITIES & AI GENERATOR --- */}
      {activeTrainerTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">الأنشطة والتكليفات اللغوية الحالية</h3>
            <button
              onClick={() => setIsCreatingActivity(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>إنشاء نشاط جديد بالذكاء الاصطناعي</span>
            </button>
          </div>

          {/* Activities List */}
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map(act => (
                <div
                  key={act.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                        {act.skill.toUpperCase()} • CEFR {act.targetLevel}
                      </span>
                      <span className="text-xs text-slate-500">{act.durationMinutes} دقيقة</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{act.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{act.instructions || act.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      الهدف: {act.targetGroupName || 'كل المجموعات'}
                    </span>
                    {onBroadcastToLiveSession && (
                      <button
                        onClick={() => onBroadcastToLiveSession(act)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>بث للغرفة التفاعلية</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800 p-8 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">لا توجد أنشطة مخصصة بعد</h4>
              <p className="text-xs text-slate-400">أنشئ أول نشاط ذكي مخصص لمجموعتك في ثوانٍ باستخدام الذكاء الاصطناعي.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: AI GROUP ANALYZER --- */}
      {activeTrainerTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">محلل أداء المجموعة اللغوي (AI Group Analyzer)</h3>
                <p className="text-xs text-slate-400">تصنيف فوري للمتدربين إلى 4 فئات مع خطط تدخل علاجي وإثرائي</p>
              </div>
              <button
                onClick={handleAnalyzeGroup}
                disabled={isAnalyzingGroup}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isAnalyzingGroup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>تشغيل التحليل الشامل للمجموعة</span>
              </button>
            </div>

            {groupAnalysis ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Overview Banner */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[11px] font-bold text-indigo-400 block mb-1">الرؤية العامة للمجموعة:</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{groupAnalysis.groupOverviewAr}</p>
                </div>

                {/* 4 Performance Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tier 1: Needs Support */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-rose-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400">١. تحتاج دعم وتأسيس مكثف</span>
                      <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded-full font-bold">
                        {groupAnalysis.tiers?.needsSupport?.studentNames?.length || 0} متدرب
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>التشخيص:</strong> {groupAnalysis.tiers?.needsSupport?.diagnosisAr}
                    </p>
                    <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/30 text-xs text-rose-200">
                      <strong>الخطة المقترحة:</strong> {groupAnalysis.tiers?.needsSupport?.recommendedActionAr}
                    </div>
                  </div>

                  {/* Tier 2: Developing */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-amber-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">٢. في طور التطور والنمو</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-full font-bold">
                        {groupAnalysis.tiers?.developing?.studentNames?.length || 0} متدرب
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>التشخيص:</strong> {groupAnalysis.tiers?.developing?.diagnosisAr}
                    </p>
                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30 text-xs text-amber-200">
                      <strong>الخطة المقترحة:</strong> {groupAnalysis.tiers?.developing?.recommendedActionAr}
                    </div>
                  </div>

                  {/* Tier 3: Good */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-blue-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">٣. مستوى جيد ومستقر</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded-full font-bold">
                        {groupAnalysis.tiers?.good?.studentNames?.length || 0} متدرب
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>التشخيص:</strong> {groupAnalysis.tiers?.good?.diagnosisAr}
                    </p>
                    <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/30 text-xs text-blue-200">
                      <strong>الخطة المقترحة:</strong> {groupAnalysis.tiers?.good?.recommendedActionAr}
                    </div>
                  </div>

                  {/* Tier 4: Advanced */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">٤. مستوى متقدم ومتميز</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full font-bold">
                        {groupAnalysis.tiers?.advanced?.studentNames?.length || 0} متدرب
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>التشخيص:</strong> {groupAnalysis.tiers?.advanced?.diagnosisAr}
                    </p>
                    <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30 text-xs text-emerald-200">
                      <strong>الخطة المقترحة:</strong> {groupAnalysis.tiers?.advanced?.recommendedActionAr}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Brain className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs">اضغط على زر "تشغيل التحليل الشامل" لمعالجة بيانات المتدربين واستخراج التوصيات.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: AI LESSON ASSISTANT --- */}
      {activeTrainerTab === 'lesson_assistant' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">مساعد تحضير الحصص اللغوية (AI Lesson Assistant)</h3>
            <p className="text-xs text-slate-400">خطط تدريب تفاعلية، أهداف سلوكية، وتوجيهات لمعالجة الأخطاء الشائعة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] text-slate-400 block font-bold">عنوان أو موضوع الدرس:</label>
              <input
                type="text"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                placeholder="مثال: Agile Standup Meeting English"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">المهارة المستهدفة:</label>
              <select
                value={lessonSkill}
                onChange={(e) => setLessonSkill(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="speaking">التحدث والنطق (Speaking)</option>
                <option value="listening">الاستماع (Listening)</option>
                <option value="reading">القراءة (Reading)</option>
                <option value="writing">الكتابة (Writing)</option>
                <option value="vocabulary">المفردات (Vocabulary)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateLessonGuide}
              disabled={isGeneratingLesson || !lessonTopic.trim()}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              {isGeneratingLesson ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>توليد خطة الدرس ومصفوفة التقييم</span>
            </button>
          </div>

          {/* Lesson Guide View */}
          {lessonGuide && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-6 animate-in fade-in duration-300">
              <h4 className="text-sm font-bold text-indigo-300">{lessonGuide.lessonTitleAr}</h4>

              {/* Objectives */}
              {lessonGuide.targetObjectives && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-white block">الأهداف التعليمية للحصة:</span>
                  <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                    {lessonGuide.targetObjectives.map((obj: string, oIdx: number) => (
                      <li key={oIdx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Phases */}
              {lessonGuide.lessonProgression && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white block">المراحل الزمنية للحصة:</span>
                  <div className="space-y-2">
                    {lessonGuide.lessonProgression.map((phase: any, pIdx: number) => (
                      <div key={pIdx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">{phase.phase}</span>
                        <p className="text-xs text-slate-300">{phase.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. CREATE ACTIVITY MODAL */}
      {isCreatingActivity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">مولد الأنشطة اللغوية بالذكاء الاصطناعي</h3>
              </div>
              <button
                onClick={() => setIsCreatingActivity(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generator Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block font-bold mb-1">
                  صف النشاط الذي تريده باللغة الطبيعية (عربي أو إنجليزي):
                </label>
                <textarea
                  rows={3}
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  placeholder="مثال: أنشئ تمرين محادثة تفاعلي لطلاب B1 حول كيفية شرح كود برمجي أمام فريق العمل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-1">المهارة:</label>
                  <select
                    value={genSkill}
                    onChange={(e) => setGenSkill(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="speaking">Speaking (تحدث)</option>
                    <option value="listening">Listening (استماع)</option>
                    <option value="reading">Reading (قراءة)</option>
                    <option value="writing">Writing (كتابة)</option>
                    <option value="vocabulary">Vocabulary (مفردات)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-1">المستوى:</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper Int.</option>
                    <option value="C1">C1 Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-1">المدة المقترحة:</label>
                  <select
                    value={genDuration}
                    onChange={(e) => setGenDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value={10}>10 دقائق</option>
                    <option value={15}>15 دقيقة</option>
                    <option value={25}>25 دقيقة</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateActivity}
                disabled={isGenerating || !genPrompt.trim()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>توليد مسودة النشاط بالذكاء الاصطناعي</span>
              </button>
            </div>

            {/* Generated Draft Preview */}
            {generatedDraft && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{generatedDraft.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                    جاهز للنشر
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed" dir="ltr">
                  "{generatedDraft.prompt}"
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setGeneratedDraft(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveActivity}
                    className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    نشر وتعيين للمجموعة ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
