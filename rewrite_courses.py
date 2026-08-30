import re

with open('src/features/academic/CoursesManagementView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replace_str = """      {/* Add Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="text-violet-400" size={18} />
                <h3 className="text-sm font-bold text-white">إضافة دورة جديدة للكتالوج</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl mb-2 text-center">
                <span className="text-[10px] text-slate-400 block mb-1">كود الدورة (Course Code)</span>
                <span className="text-lg font-black font-mono text-white tracking-widest">
                  ICT4
                </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">نوع الدورة (Course Type)</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value as any)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ICT_SCH">منهج ICT</option>
                    <option value="PROG">برمجة</option>
                    <option value="LANG">لغات</option>
                    <option value="BAS">أساسيات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الصف الأساسي (Grade)</label>
                  <select
                    value={newCourseGrade}
                    onChange={(e) => setNewCourseGrade(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                    <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                    <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                    <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الدورة الفعلي (للعرض)</label>
                <input
                  type="text"
                  placeholder="مثال: منهج الحاسب الآلي"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">إجمالي الساعات</label>
                  <input
                    type="number"
                    value={newCourseHours}
                    onChange={(e) => setNewCourseHours(Number(e.target.value))}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الرسوم (ج.م)</label>
                  <input
                    type="number"
                    value={newCourseFee}
                    onChange={(e) => setNewCourseFee(Number(e.target.value))}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  celebrate('تم ربط الدورة بالصف بنجاح وإضافتها إلى الكتالوج! 📚✨');
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                حفظ واعتماد الدورة
              </button>
            </div>
          </div>
        </div>
      )}"""

new_content = re.sub(
    r'\{/\* Add Course Modal \*/\}.*',
    replace_str,
    content,
    flags=re.DOTALL
)

with open('src/features/academic/CoursesManagementView.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Replaced course modal")
