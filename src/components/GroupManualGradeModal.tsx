import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Trophy,
  Star,
  Search,
  BookOpen,
  Plus,
  Flame,
  Check,
  Zap,
  Medal,
  ChevronDown
} from 'lucide-react';
import { Course, Group, Trainee, Exam, ExamResult } from '../types';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';

interface GroupManualGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  groups: Group[];
  trainees: Trainee[];
  exams: Exam[];
  onGradesSaved?: () => void;
  onIssueCertificate?: (trainee: Trainee, examInfo: { title: string; score: number; totalMarks: number; rank: number; courseName: string; groupName: string }) => void;
}

interface StudentGradeRow {
  traineeId: string;
  traineeCode: string;
  traineeName: string;
  traineePhoto?: string;
  attendanceStatus: 'present' | 'absent' | 'excused';
  score: number | string;
  notes: string;
}

export const GroupManualGradeModal: React.FC<GroupManualGradeModalProps> = ({
  isOpen,
  onClose,
  courses,
  groups,
  trainees,
  exams,
  onGradesSaved,
  onIssueCertificate
}) => {
  const { showToast } = useCenter();
  // Course, Group, and Exam selections
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [customExamTitle, setCustomExamTitle] = useState<string>('تقييم أعمال السنة والاختبار العملي');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(60);
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Table rows
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);
  const userEditsRef = React.useRef<Record<string, { score: number | string; attendanceStatus: 'present' | 'absent' | 'excused'; notes: string }>>({});
  const lastLoadedGroupExamRef = React.useRef<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter groups for selected course
  const availableGroups = useMemo(() => {
    return groups.filter(g => !selectedCourseId || g.courseId === selectedCourseId);
  }, [groups, selectedCourseId]);

  // Set default group when available groups change
  useEffect(() => {
    if (availableGroups.length > 0 && (!selectedGroupId || !availableGroups.find(g => g.id === selectedGroupId))) {
      setSelectedGroupId(availableGroups[0].id);
    }
  }, [availableGroups]);

  // Filter exams for selected course or group
  const availableExams = useMemo(() => {
    return exams.filter(e => !selectedCourseId || e.courseId === selectedCourseId);
  }, [exams, selectedCourseId]);

  // Populate grade rows safely without wiping user's typed scores
  useEffect(() => {
    if (!selectedGroupId) {
      setGradeRows([]);
      return;
    }

    const currentKey = `${selectedGroupId}-${selectedExamId}`;
    const isDifferentGroupOrExam = lastLoadedGroupExamRef.current !== currentKey;
    if (isDifferentGroupOrExam) {
      lastLoadedGroupExamRef.current = currentKey;
      userEditsRef.current = {};
    }

    // Get all trainees enrolled in this group
    const groupTrainees = trainees.filter(t => t.groupId === selectedGroupId);

    // If an existing exam is selected, try loading previous results
    const loadData = async () => {
      let existingResultsMap: Record<string, ExamResult> = {};
      if (selectedExamId && selectedExamId !== 'new') {
        setIsLoadingExisting(true);
        try {
          const res = await api.getExamResults(selectedExamId);
          if (Array.isArray(res)) {
            res.forEach(r => {
              existingResultsMap[r.traineeId] = r;
            });
          }
        } catch (e) {
          // ignore
        } finally {
          setIsLoadingExisting(false);
        }
      }

      const rows: StudentGradeRow[] = groupTrainees.map(t => {
        const userEdit = userEditsRef.current[t.id];
        const exist = existingResultsMap[t.id];

        return {
          traineeId: t.id,
          traineeCode: t.code || '—',
          traineeName: t.fullName,
          traineePhoto: t.photoUrl,
          attendanceStatus: userEdit?.attendanceStatus || (exist as any)?.attendanceStatus || (exist?.rating === 'راسب' && exist.score === 0 ? 'absent' : 'present'),
          score: userEdit !== undefined ? userEdit.score : (exist ? exist.score : ''),
          notes: userEdit !== undefined ? userEdit.notes : (exist?.notes || '')
        };
      });

      setGradeRows(rows);
    };

    loadData();
  }, [selectedGroupId, selectedExamId, trainees.length]);

  // Calculate ranks and top scorers
  const rankedStudents = useMemo(() => {
    const scored = gradeRows
      .filter(r => r.score !== '' && !isNaN(Number(r.score)) && r.attendanceStatus === 'present')
      .map(r => ({
        traineeId: r.traineeId,
        score: Number(r.score)
      }))
      .sort((a, b) => b.score - a.score);

    const rankMap: Record<string, number> = {};
    scored.forEach((s, idx) => {
      rankMap[s.traineeId] = idx + 1;
    });

    const topScore = scored.length > 0 ? scored[0].score : null;
    return { rankMap, topScore, count: scored.length };
  }, [gradeRows]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const presentRows = gradeRows.filter(r => r.attendanceStatus === 'present');
    const validScores = presentRows.map(r => Number(r.score)).filter(s => !isNaN(s) && s > 0);
    const avg = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    const passedCount = validScores.filter(s => s >= passingMarks).length;
    const passRate = validScores.length > 0 ? Math.round((passedCount / validScores.length) * 100) : 0;

    return {
      total: gradeRows.length,
      present: presentRows.length,
      absent: gradeRows.filter(r => r.attendanceStatus === 'absent').length,
      average: avg,
      passRate
    };
  }, [gradeRows, passingMarks]);

  // Bulk actions
  const handleBulkSetScore = (val: number) => {
    setGradeRows(gradeRows.map(r => ({ ...r, score: r.attendanceStatus === 'present' ? val : 0 })));
  };

  const handleBulkPass = () => {
    setGradeRows(gradeRows.map(r => ({ ...r, score: r.attendanceStatus === 'present' ? passingMarks : 0 })));
  };

  const handleClearScores = () => {
    setGradeRows(gradeRows.map(r => ({ ...r, score: '' })));
  };

  // Save all grades
  const handleSaveAllGrades = async () => {
    if (!selectedGroupId) {
      showToast('يرجى اختيار المجموعة أولاً.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      let activeExamId = selectedExamId;

      const groupObj = groups.find(g => g.id === selectedGroupId);
      const courseObj = courses.find(c => c.id === selectedCourseId);
      const effectiveBranchId = groupObj?.branchId || courseObj?.branchId || 'branch-1';

      // If "new" exam or no exam selected, create a quick exam first
      if (!activeExamId || activeExamId === 'new') {
        const newExamRes = await api.createExam({
          title: customExamTitle.trim() || 'رصد درجات الاختبار',
          branchId: effectiveBranchId,
          courseId: selectedCourseId,
          groupId: selectedGroupId,
          totalMarks: Number(totalMarks) || 100,
          durationMinutes: 60,
          status: 'completed',
          examDate: new Date().toISOString().split('T')[0]
        });

        if (newExamRes.success && newExamRes.exam) {
          activeExamId = newExamRes.exam.id;
        } else {
          throw new Error('فشل إنشاء سجل الاختبار الجديد');
        }
      }

      // Prepare batch payload
      const resultsPayload = gradeRows.map(r => ({
        traineeId: r.traineeId,
        score: r.attendanceStatus === 'absent' ? 0 : Number(r.score) || 0,
        attendanceStatus: r.attendanceStatus,
        notes: r.notes
      }));

      await api.saveExamResultsBatch(activeExamId, {
        results: resultsPayload,
        totalMarks: Number(totalMarks) || 100
      });

      if (onGradesSaved) {
        onGradesSaved();
      }

      showToast('تم حفظ ورصد درجات المجموعة بنجاح! 💾', 'success');
      onClose();
    } catch (err: any) {
      console.error('Error saving batch grades:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ الدرجات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger certificate for student
  const handleOpenCertificate = (row: StudentGradeRow) => {
    const traineeObj = trainees.find(t => t.id === row.traineeId);
    if (!traineeObj) return;

    const courseObj = courses.find(c => c.id === selectedCourseId);
    const groupObj = groups.find(g => g.id === selectedGroupId);
    const examObj = exams.find(e => e.id === selectedExamId);

    const rank = rankedStudents.rankMap[row.traineeId] || 1;
    const currentScore = Number(row.score) || 100;

    if (onIssueCertificate) {
      onIssueCertificate(traineeObj, {
        title: examObj?.title || customExamTitle || 'اختبار تقييم المجموعة',
        score: currentScore,
        totalMarks: totalMarks || 100,
        rank,
        courseName: courseObj?.name || 'الدورة التدريبية',
        groupName: groupObj?.name || 'المجموعة'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                رصد درجات الاختبار يدوياً لمجموعة تدريبية 📋✍️
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                حدد الجروب وقم برصد درجات المتدربين دفعة واحدة مع إمكانية إصدار شهادة تقدير للمركز الأول مباشرة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Configuration Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Course select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الدورة التدريبية
              </label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>المجموعة المستهدفة *</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={e => setSelectedGroupId(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableGroups.length === 0 && <option value="">لا توجد مجموعات مسجلة لهذه الدورة</option>}
                {availableGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاختبار أو التقييم
              </label>
              <select
                value={selectedExamId}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedExamId(val);
                  const found = exams.find(ex => ex.id === val);
                  if (found) {
                    setTotalMarks(found.totalMarks || 100);
                    setPassingMarks(found.passingMarks || 60);
                  }
                }}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="new">+ إنشاء تقييم/اختبار يدوي جديد</option>
                {availableExams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.totalMarks} درجة)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If new custom exam is chosen */}
          {(!selectedExamId || selectedExamId === 'new') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  مسمى الاختبار الجديد
                </label>
                <input
                  type="text"
                  value={customExamTitle}
                  onChange={e => setCustomExamTitle(e.target.value)}
                  placeholder="مثال: تقييم أعمال السنة، اختبار منتصف الدورة"
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  الدرجة العظمى (الإجمالية)
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={e => setTotalMarks(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  درجة النجاح
                </label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={e => setPassingMarks(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Quick Stats & Bulk Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <span>العدد:</span>
                <span className="text-slate-900 dark:text-white">{stats.total} طالب</span>
              </span>
              <span className="flex items-center gap-1">
                <span>المتوسط:</span>
                <span className="text-blue-600">{stats.average} / {totalMarks}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>نسبة النجاح:</span>
                <span className="text-emerald-600">{stats.passRate}%</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkSetScore(totalMarks)}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
              >
                تعبئة الدرجة الكاملة ({totalMarks})
              </button>

              <button
                onClick={handleBulkPass}
                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
              >
                تطبيق النجاح ({passingMarks})
              </button>

              <button
                onClick={handleClearScores}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                تفريغ
              </button>
            </div>
          </div>
        </div>

        {/* Student Grades Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
          {gradeRows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold">لا يوجد متدربون مسجلون في هذه المجموعة حالياً</p>
              <p className="text-xs text-slate-500">اختر مجموعة تدريبية أخرى تحتوي على طلاب</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="p-3 w-12 text-center">الترتيب</th>
                    <th className="p-3">بيانات المتدرب</th>
                    <th className="p-3 w-32">حالة الحضور</th>
                    <th className="p-3 w-36">الدرجة المحققة</th>
                    <th className="p-3 w-28 text-center">النسبة والتقدير</th>
                    <th className="p-3">ملاحظات إضافية</th>
                    <th className="p-3 w-36 text-center">شهادة التقدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gradeRows.map((row, idx) => {
                    const scoreNum = Number(row.score);
                    const hasValidScore = row.score !== '' && !isNaN(scoreNum) && row.attendanceStatus === 'present';
                    const percentage = hasValidScore ? Math.round((scoreNum / Math.max(totalMarks, 1)) * 100) : 0;
                    const rank = rankedStudents.rankMap[row.traineeId];
                    const isFirstPlace = rank === 1 && hasValidScore;

                    let rating = 'راسب';
                    let ratingColor = 'text-red-600 bg-red-50 dark:bg-red-950/40';
                    if (percentage >= 90) {
                      rating = 'ممتاز';
                      ratingColor = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 font-bold';
                    } else if (percentage >= 80) {
                      rating = 'جيد جداً';
                      ratingColor = 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 font-bold';
                    } else if (percentage >= 65) {
                      rating = 'جيد';
                      ratingColor = 'text-teal-700 bg-teal-50 dark:bg-teal-950/40';
                    } else if (percentage >= 50) {
                      rating = 'مقبول';
                      ratingColor = 'text-amber-700 bg-amber-50 dark:bg-amber-950/40';
                    }

                    return (
                      <tr
                        key={row.traineeId}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isFirstPlace ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        {/* Rank or Trophy */}
                        <td className="p-3 text-center">
                          {isFirstPlace ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/30" title="المركز الأول على المجموعة!">
                              🥇
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                              🥈
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/60 text-white font-bold text-[11px]">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">{idx + 1}</span>
                          )}
                        </td>

                        {/* Trainee Info */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {row.traineePhoto ? (
                              <img src={row.traineePhoto} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                                {row.traineeName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{row.traineeName}</span>
                                {isFirstPlace && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                    الأول 🏆
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">كود: {row.traineeCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Attendance Status */}
                        <td className="p-3">
                          <select
                            value={row.attendanceStatus}
                            onChange={e => {
                              const newStatus = e.target.value as StudentGradeRow['attendanceStatus'];
                              const newScore = newStatus === 'absent' ? 0 : row.score;
                              userEditsRef.current[row.traineeId] = {
                                ...userEditsRef.current[row.traineeId],
                                attendanceStatus: newStatus,
                                score: newScore,
                                notes: row.notes
                              };
                              setGradeRows(
                                gradeRows.map(r =>
                                  r.traineeId === row.traineeId
                                    ? {
                                        ...r,
                                        attendanceStatus: newStatus,
                                        score: newScore
                                      }
                                    : r
                                )
                              );
                            }}
                            className={`p-1.5 rounded-lg text-xs font-semibold border-none focus:outline-none ${
                              row.attendanceStatus === 'present'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : row.attendanceStatus === 'absent'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="present">حاضر ✔️</option>
                            <option value="absent">غائب ❌</option>
                            <option value="excused">معتذر 📝</option>
                          </select>
                        </td>

                        {/* Score Input */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={totalMarks}
                              value={row.score}
                              disabled={row.attendanceStatus === 'absent'}
                              onChange={e => {
                                const val = e.target.value;
                                userEditsRef.current[row.traineeId] = {
                                  attendanceStatus: row.attendanceStatus,
                                  notes: row.notes,
                                  ...userEditsRef.current[row.traineeId],
                                  score: val
                                };
                                setGradeRows(
                                  gradeRows.map(r => (r.traineeId === row.traineeId ? { ...r, score: val } : r))
                                );
                              }}
                              placeholder="الدرجة"
                              className={`w-24 p-2 rounded-xl text-center font-bold text-sm border focus:outline-none focus:ring-2 ${
                                row.attendanceStatus === 'absent'
                                  ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
                                  : isFirstPlace
                                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200 focus:ring-amber-500'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-emerald-500'
                              }`}
                            />
                            <span className="text-slate-400 text-xs">/ {totalMarks}</span>
                          </div>
                        </td>

                        {/* Percentage & Rating Badge */}
                        <td className="p-3 text-center">
                          {hasValidScore ? (
                            <div className="space-y-0.5">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] ${ratingColor}`}>
                                {rating}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{percentage}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={e => {
                              const val = e.target.value;
                              userEditsRef.current[row.traineeId] = {
                                attendanceStatus: row.attendanceStatus,
                                score: row.score,
                                ...userEditsRef.current[row.traineeId],
                                notes: val
                              };
                              setGradeRows(
                                gradeRows.map(r => (r.traineeId === row.traineeId ? { ...r, notes: val } : r))
                              );
                            }}
                            placeholder="ملاحظات للطالب..."
                            className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </td>

                        {/* Certificate Button */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenCertificate(row)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-all shadow-sm ${
                              isFirstPlace
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black shadow-amber-500/25 active:scale-95'
                                : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>{isFirstPlace ? 'شهادة الأول 🥇' : 'شهادة تقدير 📜'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            سيتم حفظ جميع الدرجات ورصدها تلقائياً في سجلات الطلاب وشهاداتهم.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              onClick={handleSaveAllGrades}
              disabled={isSaving || gradeRows.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ ورصد درجات المجموعة دفعة واحدة 💾'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
