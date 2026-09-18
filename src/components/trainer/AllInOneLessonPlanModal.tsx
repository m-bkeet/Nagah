import React, { useState } from 'react';
import { Sparkles, BookOpen, CheckCircle2, Play, Send, FileText, Printer, Award, Clock, Users, X, HelpCircle, Radio, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, request } from '../../services/api';
import { useCenter } from '../../context/CenterContext';

interface AllInOneLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultSubject?: string;
  defaultGrade?: string;
  onLaunchPresentation?: (slides: any[]) => void;
  onLaunchKahoot?: (quiz: any) => void;
}

export const AllInOneLessonPlanModal: React.FC<AllInOneLessonPlanModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'أساسيات وتطبيقات الحاسب والذكاء الاصطناعي',
  defaultSubject = 'تكنولوجيا المعلومات والاتصالات والحاسب الآلي',
  defaultGrade = 'الصف الأول الإعدادي',
  onLaunchPresentation,
  onLaunchKahoot
}) => {
  const { showToast } = useCenter();
  const [topic, setTopic] = useState(defaultTopic);
  const [subject, setSubject] = useState(defaultSubject);
  const [grade, setGrade] = useState(defaultGrade);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [learningGoals, setLearningGoals] = useState('');
  const [autoSaveAssignment, setAutoSaveAssignment] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'slides' | 'quiz' | 'homework' | 'modelAnswer'>('overview');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [lessonPackage, setLessonPackage] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('يرجى إدخال عنوان أو موضوع الدرس', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await request('/ai/all-in-one-lesson', {
        method: 'POST',
        body: JSON.stringify({
          topic: topic.trim(),
          subject,
          grade,
          durationMinutes,
          learningGoals,
          autoSaveAssignment
        })
      });

      if (res.success && res.package) {
        setLessonPackage(res.package);
        setActiveSubTab('overview');
        setActiveSlideIndex(0);
        showToast('تم توليد حزمة الدرس المتكاملة بنجاح بنقرة واحدة! 💎', 'success');
      } else {
        showToast(res.error || 'فشل توليد حزمة الدرس', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ أثناء الاتصال بالخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAssignmentNow = async () => {
    if (!lessonPackage?.homeworkAndWorksheet) return;
    try {
      await request('/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: lessonPackage.homeworkAndWorksheet.title || `واجب: ${lessonPackage.topic}`,
          courseName: lessonPackage.subject,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalMarks: lessonPackage.homeworkAndWorksheet.maxScore || 100,
          assignmentType: 'voice_and_written',
          instructions: lessonPackage.homeworkAndWorksheet.instructions,
          voicePrompt: lessonPackage.homeworkAndWorksheet.voiceSummaryPrompt,
          writtenTasks: lessonPackage.homeworkAndWorksheet.writtenTasks,
          modelAnswer: lessonPackage.modelAnswer,
          rubricPoints: lessonPackage.homeworkAndWorksheet.rubricPoints
        })
      });
      showToast('تم نشر الواجب والتكليف الصوتي لجميع الطلاب عبر بواباتهم بنجاح! 🚀', 'success');
    } catch (e: any) {
      showToast(e.message || 'فشل نشر الواجب', 'error');
    }
  };

  const handlePrintLessonPlan = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                حزمة الدرس المتكاملة بنقرة واحدة (Master Lesson All-in-One)
              </h2>
              <p className="text-xs text-purple-100 font-medium">
                توليد خطة الدرس + العرض التقديمي + مسابقة الكاهوت + الواجب التفاعلي ونموذج الإجابة دفعة واحدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Input Configuration Panel */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  موضوع / عنوان الدرس الرئيسي:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="مثال: مقدمة في الذكاء الاصطناعي والروبوتات"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة التدريبية:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الصف الدراسي والفئة:
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoSaveAssignment}
                  onChange={e => setAutoSaveAssignment(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>نشر وإتاحة الواجب والتسجيل الصوتي تلقائياً في بوابة الطلاب بعد التوليد</span>
              </label>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'text-amber-300'}`} />
                <span>{isLoading ? 'جاري توليد الحزمة بالذكاء الاصطناعي...' : 'توليد حزمة الدرس المتكاملة بنقرة واحدة ✨'}</span>
              </button>
            </div>
          </div>

          {/* Generated Package Output Section */}
          {lessonPackage && (
            <div className="space-y-4">
              {/* Output Sub-Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSubTab === 'overview'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>نظرة عامة والأهداف 🎯</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('slides')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSubTab === 'slides'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>شرائح العرض التقديمي ({lessonPackage.presentationSlides?.length || 0}) 📽️</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('quiz')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSubTab === 'quiz'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>تحدي كاهوت ({lessonPackage.kahootQuiz?.questions?.length || 0} أسئلة) 🎮</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('homework')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSubTab === 'homework'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>الواجب والتسجيل الصوتي 🎙️</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('modelAnswer')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSubTab === 'modelAnswer'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>نموذج الإجابة والتقييم 📝</span>
                </button>
              </div>

              {/* Sub-Tab 1: Overview & Learning Goals */}
              {activeSubTab === 'overview' && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                        {lessonPackage.lessonTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        المادة: {lessonPackage.subject} • الصف: {lessonPackage.grade} • المدة: {lessonPackage.durationMinutes} دقيقة
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintLessonPlan}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة الخطة</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-purple-700 dark:text-purple-400 mb-2">
                      الأهداف التعليمية والسلوكية المحددة للدرس:
                    </h4>
                    <div className="space-y-2">
                      {lessonPackage.objectives?.map((obj: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Presentation Slides */}
              {activeSubTab === 'slides' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      الشريحة ({activeSlideIndex + 1} من {lessonPackage.presentationSlides?.length})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeSlideIndex === 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.min((lessonPackage.presentationSlides?.length || 1) - 1, prev + 1))}
                        disabled={activeSlideIndex === (lessonPackage.presentationSlides?.length || 1) - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {lessonPackage.presentationSlides?.[activeSlideIndex] && (
                    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-2xl min-h-[260px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-black">
                            شريحة {lessonPackage.presentationSlides[activeSlideIndex].slideNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            {lessonPackage.subject}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-amber-300 mb-4">
                          {lessonPackage.presentationSlides[activeSlideIndex].title}
                        </h3>

                        <ul className="space-y-2.5 text-xs text-slate-200">
                          {lessonPackage.presentationSlides[activeSlideIndex].points?.map((pt: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                              <span className="font-bold leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>💡 ملاحظة للمدرب: {lessonPackage.presentationSlides[activeSlideIndex].teacherNotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Kahoot Quiz */}
              {activeSubTab === 'quiz' && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {lessonPackage.kahootQuiz?.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lessonPackage.kahootQuiz?.description}
                      </p>
                    </div>

                    {onLaunchKahoot && (
                      <button
                        onClick={() => onLaunchKahoot(lessonPackage.kahootQuiz)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>إطلاق مسابقة الكاهوت الآن 🚀</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {lessonPackage.kahootQuiz?.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            س{i + 1}: {q.question}
                          </span>
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-mono">
                            {q.timeLimit || 20} ثانية
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt: string, optIdx: number) => (
                            <div
                              key={optIdx}
                              className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                                optIdx === q.correctIndex
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-black'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {optIdx === q.correctIndex && '✓ '} {opt}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            الشرح: {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Homework & Voice Task */}
              {activeSubTab === 'homework' && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {lessonPackage.homeworkAndWorksheet?.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        الدرجة الكلية: {lessonPackage.homeworkAndWorksheet?.maxScore || 100} درجة
                      </p>
                    </div>

                    <button
                      onClick={handlePublishAssignmentNow}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>نشر الواجب لبوابات الطلاب فوراً 🚀</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-2">
                    <span className="text-xs font-black text-purple-800 dark:text-purple-300 block">
                      تعليمات وتوجيهات الواجب:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {lessonPackage.homeworkAndWorksheet?.instructions}
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
                      <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>التكليف الصوتي المطلوب من الطالب عبر البوابة:</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                      {lessonPackage.homeworkAndWorksheet?.voiceSummaryPrompt}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2">
                      الأسئلة والمهام التطبيقية المكتوبة:
                    </h5>
                    <div className="space-y-2">
                      {lessonPackage.homeworkAndWorksheet?.writtenTasks?.map((task: string, i: number) => (
                        <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200">
                          {i + 1}. {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: Model Answer */}
              {activeSubTab === 'modelAnswer' && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                    نموذج الإجابة ومحاور التقييم الآلي للذكاء الاصطناعي 📝
                  </h4>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                    {lessonPackage.modelAnswer}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            مركز النجاح للتدريب والاستشارات • منظومة الذكاء الاصطناعي الشاملة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
