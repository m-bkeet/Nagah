import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle,
  Clock,
  Award,
  Mic,
  Volume2,
  PenTool,
  BookMarked,
  HelpCircle,
  FileText,
  Send,
  Radio,
  Star,
  RefreshCw,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import {
  LanguageLabActivity,
  LanguageLabSubmission,
  getStoredActivities,
  saveStoredActivities,
  getStoredSubmissions,
  saveStoredSubmissions,
  callLanguageLabAI,
  CEFRLevel
} from '../../services/aiLanguageLabCore';

interface TrainerLanguageLabViewProps {
  trainer: any;
  groups: any[];
  trainees: any[];
}

export const TrainerLanguageLabView: React.FC<TrainerLanguageLabViewProps> = ({ trainer, groups, trainees }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'activities' | 'submissions' | 'ai_generator' | 'lesson_assistant' | 'group_analyzer'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  
  // Activities State
  const [activities, setActivities] = useState<LanguageLabActivity[]>(() => getStoredActivities());
  const [submissions, setSubmissions] = useState<LanguageLabSubmission[]>(() => getStoredSubmissions());

  // New Activity Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<LanguageLabActivity['type']>('speaking');
  const [newLevel, setNewLevel] = useState<CEFRLevel>('B1');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState(15);
  const [newDueDate, setNewDueDate] = useState('');
  const [newTargetSkill, setNewTargetSkill] = useState('Speaking & Pronunciation');

  // AI Activity Generator State
  const [aiPromptTopic, setAiPromptTopic] = useState('مقابلة عمل برمجية لطلاب مستوى B1');
  const [aiGeneratedActivity, setAiGeneratedActivity] = useState<any | null>(null);
  const [isGeneratingActivity, setIsGeneratingActivity] = useState(false);

  // AI Lesson Assistant State
  const [lessonTopic, setLessonTopic] = useState('شرح قواعد الفعل الماضي والأزمنة التقنية');
  const [lessonAssistantAdvice, setLessonAssistantAdvice] = useState<string>('سيقوم المساعد الذكي بتوليد الأهداف والأخطاء المتوقعة والأنشطة العلاجية.');
  const [isLoadingAssistant, setIsLoadingAssistant] = useState(false);

  // Filter trainees by trainer groups
  const trainerGroups = groups.filter((g: any) => !trainer?.id || g.trainerId === trainer.id || true);
  const filteredTrainees = trainees.filter((t: any) => {
    if (selectedGroupId === 'all') return true;
    return t.groupId === selectedGroupId || t.groupDetails?.id === selectedGroupId;
  });

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newAct: LanguageLabActivity = {
      id: `act-${Date.now()}`,
      trainerId: trainer?.id,
      groupId: selectedGroupId !== 'all' ? selectedGroupId : undefined,
      title: newTitle,
      type: newType,
      level: newLevel,
      description: newDesc,
      durationMinutes: newDuration,
      maxGrade: 100,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      targetSkill: newTargetSkill,
      assignedTo: selectedGroupId !== 'all' ? 'group' : 'all',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newAct, ...activities];
    setActivities(updated);
    saveStoredActivities(updated);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleGenerateAIActivity = async () => {
    if (!aiPromptTopic.trim()) return;
    setIsGeneratingActivity(true);
    const prompt = `Generate a complete language lab activity based on this request: "${aiPromptTopic}". Include title, description, target CEFR level, skill, duration, and questions. Respond in Arabic/English format.`;
    const res = await callLanguageLabAI(prompt, 'reasoning');
    setAiGeneratedActivity({
      title: aiPromptTopic,
      details: res
    });
    setIsGeneratingActivity(false);
  };

  const handleAskLessonAssistant = async () => {
    setIsLoadingAssistant(true);
    const prompt = `As an expert AI pedagogical assistant for language trainers, give lesson objectives, common mistakes, grading tips, remedial activity for weak students, and advanced activity for top students regarding topic: "${lessonTopic}".`;
    const advice = await callLanguageLabAI(prompt, 'reasoning');
    setLessonAssistantAdvice(advice);
    setIsLoadingAssistant(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold shrink-0 shadow-lg shadow-indigo-500/10">
              🎓
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                معمل اللغات — بوابة المدرب (Trainer Language Lab)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة مجموعاتك، إنشاء وتكليف أنشطة اللغات، توليد المهام بالذكاء الاصطناعي، وتحليل أداء الطلاب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء نشاط لغة جديد</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-slate-800 pb-1">
          {[
            { id: 'groups', label: 'مجموعاتي والطلاب 👥', icon: Users },
            { id: 'activities', label: 'أنشطة المعمل المجدولة 📋', icon: BookOpen },
            { id: 'submissions', label: 'متابعة الواجبات والتسليمات 📥', icon: CheckCircle },
            { id: 'ai_generator', label: 'توليد الأنشطة بالذكاء الاصطناعي ⚡', icon: Sparkles },
            { id: 'lesson_assistant', label: 'مساعد الدرس الذكي 🤖', icon: Award },
            { id: 'group_analyzer', label: 'تحليل مستويات المجموعات 📊', icon: RefreshCw }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: GROUPS & TRAINEES */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">اختر المجموعة للمتابعة:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">جميع المجموعات ({trainerGroups.length})</option>
                {trainerGroups.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-indigo-400 font-bold">عدد المتدربين: {filteredTrainees.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainees.map((t: any) => (
              <div key={t.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {t.fullName?.[0] || 'ط'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{t.fullName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{t.code || 'بدون كود'}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">B1</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>Speaking: <strong className="text-emerald-400">82%</strong></div>
                  <div>Listening: <strong className="text-teal-400">88%</strong></div>
                  <div>Vocabulary: <strong className="text-amber-400">79%</strong></div>
                  <div>Writing: <strong className="text-cyan-400">75%</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div key={act.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    {act.type} • {act.level}
                  </span>
                  <span className="text-xs text-slate-400">موعد التسليم: {act.dueDate}</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm">{act.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>المدة: {act.durationMinutes} دقيقة</span>
                  <span>المهارة: <strong className="text-indigo-300">{act.targetSkill}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">المتدرب</th>
                  <th className="p-3">النشاط</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">تقييم الـ AI</th>
                  <th className="p-3">ملاحظات المدرب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-100">{sub.studentName}</td>
                    <td className="p-3">نشاط محادثة تقنية</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{sub.status}</span>
                    </td>
                    <td className="p-3 text-teal-400 font-mono font-bold">{sub.aiScore?.overall || 80}%</td>
                    <td className="p-3 text-slate-400">{sub.trainerFeedback?.note || 'تم المراجعة'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AI ACTIVITY GENERATOR */}
      {activeTab === 'ai_generator' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">مولد الأنشطة بالذكاء الاصطناعي (AI Activity Generator)</h3>
            <p className="text-xs text-slate-400">اكتب وصفاً للنشاط وسيقوم الـ AI بتوليده بالكامل مع الأسئلة والمستوى</p>
          </div>

          <input
            type="text"
            value={aiPromptTopic}
            onChange={(e) => setAiPromptTopic(e.target.value)}
            placeholder="مثال: أنشئ نشاط Speaking لطلاب B1 عن مقابلة عمل في مجال البرمجة"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleGenerateAIActivity}
            disabled={isGeneratingActivity}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {isGeneratingActivity ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>توليد النشاط الآن بالذكاء الاصطناعي</span>
          </button>

          {aiGeneratedActivity && (
            <div className="bg-slate-950 border border-indigo-500/40 p-5 rounded-2xl space-y-3 animate-fadeIn">
              <h4 className="font-bold text-indigo-300 text-xs">النشاط المُولد: {aiGeneratedActivity.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiGeneratedActivity.details}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LESSON ASSISTANT */}
      {activeTab === 'lesson_assistant' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">مساعد المدرب الذكي (AI Lesson Assistant)</h3>
              <p className="text-xs text-slate-400">يقترح أهداف الدرس، الأخطاء المتوقعة، والأنشطة العلاجية للطلاب</p>
            </div>
            <button
              onClick={handleAskLessonAssistant}
              disabled={isLoadingAssistant}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5"
            >
              {isLoadingAssistant ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>طلب تحليل المساعد</span>
            </button>
          </div>

          <input
            type="text"
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />

          <div className="bg-slate-950 border border-indigo-500/30 p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-indigo-300 text-xs">توصيات مساعد المدرب:</h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{lessonAssistantAdvice}</p>
          </div>
        </div>
      )}

      {/* TAB 6: GROUP ANALYZER */}
      {activeTab === 'group_analyzer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">تحليل أداء المجموعة الذكي (AI Group Analyzer)</h3>
            <p className="text-xs text-slate-400">يقسم الطلاب إلى: يحتاج دعم (Needs Support) - متطور (Developing) - جيد (Good) - متقدم (Advanced)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-rose-300 text-xs">يحتاج دعم (Needs Support)</h4>
              <p className="text-[11px] text-slate-300">طالبان بحاجة لتمارين إضافية في القواعد والنطق.</p>
            </div>
            <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-amber-300 text-xs">متطور (Developing)</h4>
              <p className="text-[11px] text-slate-300">5 طلاب في مسار النمو والتحسن المستمر.</p>
            </div>
            <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-teal-300 text-xs">جيد (Good)</h4>
              <p className="text-[11px] text-slate-300">8 طلاب بمستوى مستقر وثابت.</p>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-emerald-300 text-xs">متقدم (Advanced)</h4>
              <p className="text-[11px] text-slate-300">3 طلاب يظهرون تميزاً في المحادثة التقنية.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">إنشاء نشاط لغة جديد</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان النشاط</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: نشاط محادثة في المطار أو مقابلة برمجية"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع المهارة</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="speaking">محادثة (Speaking)</option>
                    <option value="listening">استماع (Listening)</option>
                    <option value="reading">قراءة (Reading)</option>
                    <option value="writing">كتابة (Writing)</option>
                    <option value="vocabulary">مفردات (Vocabulary)</option>
                    <option value="grammar">قواعد (Grammar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المستوى (CEFR)</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف النشاط والتعليمات</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتب تفاصيل التكليف للطلاب..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المدة (بالدقائق)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">موعد التسليم</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md"
                >
                  حفظ وتكليف النشاط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
