import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, ExternalLink, ShieldAlert, ZoomIn, ZoomOut, RefreshCw, BookOpen, Trash2 } from 'lucide-react';

interface CourseMaterial {
  id: string;
  title: string;
  course_name: string;
  branch_id: string;
  group_name?: string;
  drive_file_id: string;
  created_at?: string;
}

interface DriveViewerProps {
  isAdmin?: boolean;
  groupName?: string; // Optional group filter/context
}

export const DriveViewer: React.FC<DriveViewerProps> = ({ isAdmin = false, groupName }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for new material
  const [newTitle, setNewTitle] = useState('');
  const [newCourseName, setNewCourseName] = useState('برمجة الويب وتطوير الواجهات');
  const [newBranchId, setNewBranchId] = useState('branch-najah');
  const [newGroupName, setNewGroupName] = useState(groupName || 'مجموعة الصباح');
  const [newFileId, setNewFileId] = useState('');

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const url = groupName ? `/api/materials?group_name=${encodeURIComponent(groupName)}` : '/api/materials';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
        if (data.length > 0 && !selectedMaterial) {
          setSelectedMaterial(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [groupName]);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newFileId) return;

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'mat-' + Date.now(),
          title: newTitle,
          course_name: newCourseName,
          branch_id: newBranchId,
          group_name: newGroupName || 'عام',
          drive_file_id: newFileId.trim()
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewFileId('');
        setIsAdding(false);
        fetchMaterials();
      }
    } catch (err) {
      console.error('Failed to add material:', err);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.group_name && m.group_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[750px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            مكتبة المناهج والمذكرات الرقمية (Google Drive)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            استعرض المذكرات والمستندات التعليمية المحمية مباشرة من سحابة مركز النجاح
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input 
              type="text"
              placeholder="بحث في المناهج..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              إضافة مذكرة
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6 flex-1 overflow-hidden">
        {/* Sidebar List */}
        <div className="lg:col-span-1 border-l border-slate-200 dark:border-slate-800 pl-4 flex flex-col overflow-y-auto space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">المذكرات المتاحة ({filteredMaterials.length})</h3>
          
          {loading ? (
            <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">لا توجد مذكرات مطابقة للبحث</div>
          ) : (
            filteredMaterials.map(mat => (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  selectedMaterial?.id === mat.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600/50 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className={`w-5 h-5 mt-0.5 ${selectedMaterial?.id === mat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{mat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{mat.course_name}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Viewer Stage */}
        <div className="lg:col-span-3 flex flex-col bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          {selectedMaterial ? (
            <>
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg">
                    {selectedMaterial.course_name}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 10, 80))} 
                      className="p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                      title="تصغير"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300">{zoomLevel}%</span>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))} 
                      className="p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                      title="تكبير"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <a
                    href={`https://drive.google.com/file/d/${selectedMaterial.drive_file_id}/view`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg"
                  >
                    <span>فتح في نافذة مستقلة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* PDF Preview Iframe Container with zoom transform */}
              <div className="flex-1 overflow-auto p-4 flex justify-center items-center">
                <div 
                  className="w-full h-full transition-transform duration-200 shadow-2xl rounded-xl overflow-hidden bg-white"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <iframe
                    src={`https://drive.google.com/file/d/${selectedMaterial.drive_file_id}/preview`}
                    className="w-full h-full border-0 select-none"
                    title={selectedMaterial.title}
                    allow="autoplay"
                  />
                </div>
              </div>

              {/* Security Warning Footer */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>المحتوى محمي ومنع التحميل المباشر والنسخ عبر سياسة حماية مركز النجاح.</span>
                </div>
                <span className="font-mono">Google Drive Secure Iframe</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <FileText className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">اختر مذكرة من القائمة الجانبية للعرض الفوري</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">إضافة مذكرة رقمية جديدة</h3>
            
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المذكرة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مذكرة شرح React المتقدمة"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المادة / الكورس</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المجموعة المستهدفة (Group Name)</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="مثال: مجموعة الصباح أو عام"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">ستظهر هذه المذكرة فقط للطلاب التابعين لهذه المجموعة أو كعام</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">معرّف ملف جوجل درايف (Drive File ID)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                  value={newFileId}
                  onChange={e => setNewFileId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">هو الكود الموجود في رابط ملف جوجل درايف بين /d/ و /view</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  حفظ ونشر المذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
