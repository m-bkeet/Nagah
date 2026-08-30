import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HomeworkSubmission, AssignmentTask, Course, Group } from '../types';
import { 
  CheckSquare, Search, Calendar, FileText, CheckCircle2, 
  X, Eye, BookOpen, User, Image as ImageIcon, MessageSquare, Star, Edit, Save,
  Plus, Sparkles, Clock, AlertTriangle, Download, Send, Mic, Play, Trash2,
  Award, TrendingUp, BarChart3, Filter, Code2, Link as LinkIcon, Paperclip, Check
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import confetti from 'canvas-confetti';

export const HomeworksView: React.FC = () => {
  const { showToast, activeBranchId } = useCenter();
  const [activeTab, setActiveTab] = useState<'submissions' | 'create_task' | 'tasks_list' | 'analytics'>('submissions');

  // Primary Data
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>([]);
  const [assignments, setAssignments] = useState<AssignmentTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Submission Modal
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editForm, setEditForm] = useState({
    grade: 0,
    trainerNotes: '',
    generalFeedback: '',
    stars: 0,
    audioFeedbackUrl: '',
    bonusPoints: 0
  });

  // Batch Grading State
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    grade: 100,
    trainerNotes: 'عمل ممتاز وتم التقييم الجماعي بنجاح.',
    generalFeedback: 'إجابة مكتملة ومطابقة للمطلوب.',
    bonusPoints: 5
  });

  // Assignment Creator Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    courseId: '',
    groupId: '',
    totalMarks: 100,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    preventLateSubmission: true,
    codeTemplate: 'def solution():\n    # اكتب كود الحل هنا\n    pass',
    programmingLanguage: 'python',
    attachments: [] as { id: string; name: string; url: string; type: 'image' | 'pdf' | 'link' }[],
    testCases: [] as { input: string; expectedOutput: string; description: string; points: number }[]
  });

  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Audio Recording State for Feedback
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    loadData();
  }, [activeBranchId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hwRes, assignRes, courseRes, grpRes] = await Promise.all([
        fetch('/api/homeworks').then(r => r.json()),
        api.getAssignments(activeBranchId !== 'all' ? { branchId: activeBranchId } : undefined),
        api.getCourses(),
        api.getGroups()
      ]);

      setHomeworks(Array.isArray(hwRes) ? hwRes : []);
      setAssignments(Array.isArray(assignRes) ? assignRes : []);
      setCourses(Array.isArray(courseRes) ? courseRes : []);
      setGroups(Array.isArray(grpRes) ? grpRes : []);
    } catch (err) {
      console.error(err);
      showToast('فشل تحميل بيانات الواجبات والتكاليف', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubmission) {
      setEditForm({
        grade: selectedSubmission.grade || 0,
        trainerNotes: selectedSubmission.trainerNotes || '',
        generalFeedback: selectedSubmission.generalFeedback || '',
        stars: selectedSubmission.stars || 0,
        audioFeedbackUrl: selectedSubmission.audioFeedbackUrl || '',
        bonusPoints: 0
      });
      setIsEditingReport(false);
      setAudioBlobUrl(selectedSubmission.audioFeedbackUrl || null);
    }
  }, [selectedSubmission]);

  // Audio Recording Handlers
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
        setEditForm(prev => ({ ...prev, audioFeedbackUrl: url }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);
      showToast('جاري تسجيل الملاحظة الصوتية...', 'info');
    } catch (err) {
      console.error(err);
      showToast('يرجى السماح بصلاحية الميكروفون للتسجيل', 'error');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorder && isRecordingAudio) {
      mediaRecorder.stop();
      setIsRecordingAudio(false);
      showToast('تم حفظ التسجيل الصوتي المباشر 🎙️', 'success');
    }
  };

  // Generate Test Cases with AI
  const handleGenerateTestCases = async () => {
    if (!taskForm.title || !taskForm.description) {
      showToast('يرجى كتابة عنوان التكليف والوصف أولاً لإنشاء اختبارات الحالات بالذكاء الاصطناعي', 'error');
      return;
    }

    setIsGeneratingTestCases(true);
    try {
      const selectedCourse = courses.find(c => c.id === taskForm.courseId);
      const res = await api.generateTestCases({
        title: taskForm.title,
        description: taskForm.description,
        programmingLanguage: taskForm.programmingLanguage,
        courseName: selectedCourse?.name
      });

      if (res.success && Array.isArray(res.testCases)) {
        setTaskForm(prev => ({ ...prev, testCases: res.testCases }));
        showToast('تم توليد اختبارات الحالات بنجاح بواسطة AI ✨', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('فشل توليد حالات الاختبار', 'error');
    } finally {
      setIsGeneratingTestCases(false);
    }
  };

  // Create Assignment Task
  const handleCreateAssignmentTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.courseId) {
      showToast('عنوان الواجب والدورة حقول إجبارية', 'error');
      return;
    }

    setIsCreatingTask(true);
    try {
      const selectedCourse = courses.find(c => c.id === taskForm.courseId);
      const selectedGroup = groups.find(g => g.id === taskForm.groupId);

      const res = await api.createAssignment({
        ...taskForm,
        courseName: selectedCourse?.name,
        groupName: selectedGroup?.name,
        branchId: activeBranchId !== 'all' ? activeBranchId : 'branch-1'
      });

      if (res.success) {
        showToast('تم نشر الواجب والتكليف الجديد بنجاح 🎉', 'success');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setAssignments(prev => [res.assignment, ...prev]);
        setTaskForm({
          title: '',
          description: '',
          courseId: '',
          groupId: '',
          totalMarks: 100,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
          preventLateSubmission: true,
          codeTemplate: 'def solution():\n    # اكتب كود الحل هنا\n    pass',
          programmingLanguage: 'python',
          attachments: [],
          testCases: []
        });
        setActiveTab('tasks_list');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'فشل نشر التكليف البرمجي', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Update Submission Report & Manual Feedback
  const handleUpdateReport = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await fetch(`/api/homeworks/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: editForm.grade,
          trainerNotes: editForm.trainerNotes,
          generalFeedback: editForm.generalFeedback,
          stars: editForm.stars,
          audioFeedbackUrl: editForm.audioFeedbackUrl,
          bonusPoints: editForm.bonusPoints
        })
      });
      if (!res.ok) throw new Error('Failed to update report');
      
      const updated = await res.json();
      setHomeworks(prev => prev.map(h => h.id === updated.id ? updated : h));
      setSelectedSubmission(updated);
      setIsEditingReport(false);
      showToast('تم حفظ التقييم والملاحظات الصوتية بنجاح 🎉', 'success');
    } catch (err) {
      console.error(err);
      showToast('فشل في تحديث التقرير', 'error');
    }
  };

  // Batch Grade Submissions
  const handleExecuteBatchGrade = async () => {
    if (selectedSubmissionIds.length === 0) return;
    try {
      const res = await api.batchGradeHomeworks({
        submissionIds: selectedSubmissionIds,
        grade: batchForm.grade,
        trainerNotes: batchForm.trainerNotes,
        generalFeedback: batchForm.generalFeedback,
        bonusPoints: batchForm.bonusPoints
      });

      if (res.success) {
        showToast(res.message, 'success');
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        setSelectedSubmissionIds([]);
        setIsBatchModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      showToast('فشل تطبيق التصحيح الجماعي', 'error');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('هل أنت أخيرًا متأكد من حذف هذا الواجب والتكليف المنشور؟')) return;
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      showToast('تم حذف الواجب بنجاح', 'success');
    } catch (err) {
      showToast('فشل حذف الواجب', 'error');
    }
  };

  // Filtering Submissions
  const filteredHomeworks = homeworks.filter(h => {
    const matchesSearch = 
      h.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.courseName && h.courseName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = courseFilter === 'all' || h.courseId === courseFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'reviewed' && (h.status === 'reviewed' || h.status === 'graded')) ||
      (statusFilter === 'pending' && h.status === 'pending') ||
      (statusFilter === 'late' && h.isLate);

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Calculate Analytics
  const totalSubmissionsCount = homeworks.length;
  const gradedCount = homeworks.filter(h => h.grade > 0 || h.status === 'graded').length;
  const avgGrade = homeworks.length > 0 
    ? Math.round(homeworks.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / homeworks.length)
    : 0;
  const onTimeRate = homeworks.length > 0 
    ? Math.round((homeworks.filter(h => !h.isLate).length / homeworks.length) * 100)
    : 100;

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-fade-in pb-24 text-slate-100" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/30">
              Nagah LMS Engine
            </span>
            <span className="text-slate-400 text-xs">• تصحيح آلي وتكليف تفاعلي</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2 mt-1">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            منظومة الواجبات والتكاليف البرمجية الذكية
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            إنشاء التكاليف مع توليد حالات الاختبار بالـ AI، تصحيح آلي، تسجيل صوتي، وتقارير أداء فورية.
          </p>
        </div>

        {/* Top Action Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>تسليمات الطلاب ({homeworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create_task')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create_task'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء واجب جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks_list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tasks_list'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>التكاليف المنشورة ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>التحليلات والإحصائيات</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SUBMISSIONS & GRADING */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Filter Bar & Batch Actions */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب، الواجب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كل المواد والدورات</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">بانتظار التصحيح</option>
                <option value="reviewed">تم التصحيح والتقييم</option>
                <option value="late">تسليم متأخر</option>
              </select>
            </div>

            {/* Batch Action Trigger */}
            {selectedSubmissionIds.length > 0 && (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تصحيح جماعي لـ ({selectedSubmissionIds.length}) طلاب</span>
              </button>
            )}
          </div>

          {/* Submissions List Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              جاري تحميل واجبات الطلاب...
            </div>
          ) : filteredHomeworks.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
              <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-slate-300 mb-2">لا توجد واجبات مرسلة حتى الآن</h3>
              <p className="text-slate-500 text-xs">تأكد من نشر التكاليف للطلاب أو اختيار فلتر بحث مختلف.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHomeworks.map(hw => {
                const isSelected = selectedSubmissionIds.includes(hw.id);
                return (
                  <div 
                    key={hw.id} 
                    className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-sm group relative ${
                      isSelected ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Checkbox for batch select */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubmissionIds(prev => [...prev, hw.id]);
                          } else {
                            setSelectedSubmissionIds(prev => prev.filter(id => id !== hw.id));
                          }
                        }}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-start mb-4 pr-1 pl-6">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-100 text-sm mb-1 line-clamp-1">{hw.taskTitle}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-slate-200">{hw.traineeName}</span>
                          <span className="text-slate-600">({hw.traineeCode})</span>
                        </div>
                      </div>
                      <div className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap">
                        {hw.grade} / {hw.maxGrade}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(hw.submittedAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {hw.isLate ? (
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                          تسليم متأخر
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                          في الموعد
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تقييم AI جاهز</span>
                      </div>
                      <button
                        onClick={() => setSelectedSubmission(hw)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>عرض وتصحيح</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE NEW ASSIGNMENT TASK */}
      {activeTab === 'create_task' && (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              إنشاء وتخصيص واجب / تكليف برمجي جديد
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              حدد عنوان التكليف، تاريخ التسليم، واكتب كود البداية ليحل الطالب مباشرة داخل Portal.
            </p>
          </div>

          <form onSubmit={handleCreateAssignmentTask} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">عنوان الواجب / التكليف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تطبيق آلة حاسبة بلغة Python"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">المادة / الدورة التدريبية *</label>
                <select
                  required
                  value={taskForm.courseId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">اختيار الدورة التدريبية...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">المجموعة التدريبية (اختياري)</label>
                <select
                  value={taskForm.groupId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, groupId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">جميع مجموعات الدورة</option>
                  {groups.filter(g => !taskForm.courseId || g.courseId === taskForm.courseId).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">الدرجة الكلية *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={taskForm.totalMarks}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">لغة البرمجة</label>
                  <select
                    value={taskForm.programmingLanguage}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, programmingLanguage: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html_css">HTML & CSS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">تاريخ وتوقيت الموعد النهائي (Due Date) *</label>
                <input
                  type="datetime-local"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="preventLate"
                  checked={taskForm.preventLateSubmission}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, preventLateSubmission: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="preventLate" className="text-xs font-bold text-slate-200 cursor-pointer select-none">
                  قفل ومنع التسليم النهائي بعد انقضاء الوقت المحجوز تلقائياً 🚫
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">وصف التكليف والتعليمات التفصيلية</label>
              <textarea
                rows={3}
                placeholder="اكتب تعليمات الشرح، الشروط والمطلوب بالتفصيل..."
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Code Template Box */}
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                قالب الكود المبدئي للطالب (Code Starter Template)
              </label>
              <textarea
                rows={4}
                value={taskForm.codeTemplate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, codeTemplate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>

            {/* AI Test Cases Generator Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  اختبارات الحالات التلقائية للحل (Unit Test Cases)
                </h4>
                <button
                  type="button"
                  onClick={handleGenerateTestCases}
                  disabled={isGeneratingTestCases}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingTestCases ? 'جاري التوليد بـ AI...' : 'توليد تلقائي بـ AI'}</span>
                </button>
              </div>

              {taskForm.testCases.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">
                  انقر على "توليد تلقائي بـ AI" لإنشاء اختبارات الدخل والخرج المتوقع تلقائياً بناءً على وصف التكليف.
                </p>
              ) : (
                <div className="space-y-2">
                  {taskForm.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
                      <div className="flex-1 space-y-1">
                        <div className="font-bold text-slate-200">{tc.description}</div>
                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]" dir="ltr">
                          <span>In: <strong className="text-amber-400">{tc.input}</strong></span>
                          <span>Expected: <strong className="text-emerald-400">{tc.expectedOutput}</strong></span>
                        </div>
                      </div>
                      <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold">
                        {tc.points} درجات
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingTask}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isCreatingTask ? 'جاري نشر الواجب...' : 'نشر الواجب للطلاب الآن 🚀'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PUBLISHED ASSIGNMENTS LIST */}
      {activeTab === 'tasks_list' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">قائمة الواجبات والتكاليف المنشورة المتاحة للطلاب:</h3>
          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-slate-300 mb-2">لا توجد واجبات منشورة</h3>
              <p className="text-slate-500 text-xs">قم بإنشاء وتعيين تكليف جديد من تبويب "إنشاء واجب جديد".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(a => (
                <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20 mb-1 inline-block">
                          {a.courseName}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm">{a.title}</h4>
                      </div>
                      <div className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-1 rounded-lg border border-slate-800">
                        {a.totalMarks} درجة
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {a.description || 'لا يوجد وصف تفصيلي'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>تسليم قبل: {new Date(a.dueDate).toLocaleDateString('ar-EG')}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition-colors"
                      title="حذف الواجب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS & STATS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">إجمالي الواجبات المستلمة</div>
                <div className="text-2xl font-black text-amber-400">{totalSubmissionsCount}</div>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">متوسط درجات الفصول</div>
                <div className="text-2xl font-black text-emerald-400">{avgGrade}%</div>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">نسبة التسليم في الموعد</div>
                <div className="text-2xl font-black text-blue-400">{onTimeRate}%</div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">تم المراجعة والاعتماد</div>
                <div className="text-2xl font-black text-purple-400">{gradedCount} / {totalSubmissionsCount}</div>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              قائمة الطلاب الأكثر التزاماً وتفوقاً في التكاليف البرمجية
            </h4>
            <div className="space-y-3">
              {homeworks.slice(0, 5).map((hw, idx) => (
                <div key={hw.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{hw.traineeName}</div>
                      <div className="text-[10px] text-slate-500">{hw.courseName || 'الدورة البرمجية'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400 text-sm">{hw.grade} / {hw.maxGrade}</div>
                    <div className="text-[10px] text-amber-400">{hw.rating || 'ممتاز'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION EVALUATION MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{selectedSubmission.taskTitle}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedSubmission.traineeName} ({selectedSubmission.traineeCode})</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col lg:flex-row gap-6">
              {/* Right Side: Code / Attachment */}
              <div className="lg:w-1/2 space-y-4">
                {selectedSubmission.codeSolution ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4" />
                      كود الحل المكتوب من الطالب:
                    </h4>
                    <pre className="text-xs text-emerald-400 font-mono p-3 bg-slate-900 rounded-xl overflow-x-auto max-h-60" dir="ltr">
                      {selectedSubmission.codeSolution}
                    </pre>
                  </div>
                ) : selectedSubmission.mediaUrl ? (
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2">
                    <img 
                      src={selectedSubmission.mediaUrl} 
                      alt="Homework" 
                      className="w-full h-auto object-contain max-h-64 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 text-center py-8 bg-slate-950 rounded-2xl">
                    لا يوجد مرفق كود أو صورة
                  </div>
                )}

                {/* AI Test Case Results if present */}
                {selectedSubmission.testCaseResults && selectedSubmission.testCaseResults.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200">نتائج اختبار الحالات بالذكاء الاصطناعي:</h4>
                    {selectedSubmission.testCaseResults.map((tc, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <span className="font-mono text-slate-300" dir="ltr">In: {tc.input}</span>
                        <span className={tc.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {tc.passed ? '✓ اجتاز' : '✗ لم يجتاز'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Left Side: Evaluation & Voice Notes */}
              <div className="lg:w-1/2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">تصحيح وإسناد الدرجة للمعلم:</h4>
                    <div className="text-sm font-black text-amber-400">{editForm.grade} / {selectedSubmission.maxGrade}</div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={selectedSubmission.maxGrade}
                    value={editForm.grade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, grade: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات المعلم النصية:</label>
                    <textarea
                      rows={3}
                      value={editForm.trainerNotes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, trainerNotes: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Voice Note Recording Box */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      إضافة ملاحظة صوتية للمعلم للطالب:
                    </label>

                    <div className="flex items-center gap-3">
                      {!isRecordingAudio ? (
                        <button
                          type="button"
                          onClick={startRecordingAudio}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>بدء التسجيل الصوتي</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecordingAudio}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>إيقاف وحفظ الصوت</span>
                        </button>
                      )}

                      {audioBlobUrl && (
                        <audio src={audioBlobUrl} controls className="h-8 max-w-xs" />
                      )}
                    </div>
                  </div>

                  {/* Bonus Points Awarder */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">منح نقاط تميز إضافية:</span>
                    <input
                      type="number"
                      min={0}
                      value={editForm.bonusPoints}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bonusPoints: Number(e.target.value) }))}
                      className="w-20 bg-slate-900 border border-slate-800 text-center text-xs py-1 rounded-lg text-amber-400 font-bold"
                    />
                  </div>

                  <button
                    onClick={handleUpdateReport}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ واعتماد التقييم رسمياً</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCH GRADING MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              تصحيح جماعي لـ ({selectedSubmissionIds.length}) طلاب
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الدرجة الموحدة:</label>
              <input
                type="number"
                value={batchForm.grade}
                onChange={(e) => setBatchForm(prev => ({ ...prev, grade: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظة التصحيح الجماعية:</label>
              <textarea
                rows={2}
                value={batchForm.trainerNotes}
                onChange={(e) => setBatchForm(prev => ({ ...prev, trainerNotes: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نقاط تميز إضافية لكل طالب (+Points):</label>
              <input
                type="number"
                value={batchForm.bonusPoints}
                onChange={(e) => setBatchForm(prev => ({ ...prev, bonusPoints: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExecuteBatchGrade}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition-all"
              >
                تطبيق التصحيح الجماعي
              </button>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
