import React, { useState, useEffect } from 'react';
import {
  Users,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { listGoogleClassroomCourses, getWorkspaceAccessToken } from '../services/googleWorkspace';

export interface GoogleClassroomImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (courses: any[]) => Promise<void>;
}

export const GoogleClassroomImportModal: React.FC<GoogleClassroomImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const { showToast } = useCenter();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const token = await getWorkspaceAccessToken();
      if (!token) {
        throw new Error('يرجى تسجيل الدخول إلى Google Workspace أولاً من الإعدادات.');
      }
      const fetchedCourses = await listGoogleClassroomCourses(token);
      setCourses(fetchedCourses);
    } catch (err: any) {
      setError(err?.message || 'فشل جلب دورات Google Classroom');
    } finally {
      setIsFetching(false);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleImport = async () => {
    if (selectedCourseIds.length === 0) return;
    setIsLoading(true);
    try {
      const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));
      await onImport(selectedCourses);
      showToast(`تم استيراد ${selectedCourses.length} دورة بنجاح`, 'success');
      onClose();
    } catch (err: any) {
      showToast('حدث خطأ أثناء الاستيراد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">استيراد دورات من Google Classroom</h2>
              <p className="text-xs text-slate-400">اختر الدورات التي تريد استيرادها كدورات تدريبية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
          {error ? (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : isFetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p>جارٍ تحميل الدورات...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>لا توجد دورات متاحة في Google Classroom.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map(course => (
                <label key={course.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{course.name}</h4>
                      {course.section && <p className="text-xs text-slate-400">{course.section}</p>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-all font-bold text-sm"
          >
            إلغاء
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || selectedCourseIds.length === 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? 'جاري الاستيراد...' : `استيراد (${selectedCourseIds.length}) دورة`}
          </button>
        </div>
      </div>
    </div>
  );
};
