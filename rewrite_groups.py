import re

with open('src/features/academic/GroupsManagementView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the state variables and the Create Group Modal content

new_state_vars = """
  // Auto Group Code Generation State
  const [newCourseCode, setNewCourseCode] = useState('ICT4');
  const [newBranchCode, setNewBranchCode] = useState('N');
  const [newLanguage, setNewLanguage] = useState('E');
  
  // Predict sequence number
  const predictedSeq = 1;
  const autoGroupCode = `${newCourseCode}-${newBranchCode}-${newLanguage}-${predictedSeq}`;
  const [conflictStatus, setConflictStatus] = useState<'NONE' | 'LAB' | 'TRAINER'>('NONE');
"""

# Let's just find and replace the Create Group Modal
search_str = """      {/* Create Group Modal */}
      {isCreateModalOpen && ("""

replace_str = """      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="text-purple-400" size={18} />
                <h3 className="text-sm font-bold text-white">إنشاء مجموعة تدريبية جديدة</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-purple-500/30 text-center">
                <span className="text-[10px] text-slate-400 block mb-1">كود المجموعة التلقائي (محمي من التكرار)</span>
                <span className="text-2xl font-black font-mono text-white tracking-widest">
                  {/* Fake state for this view */}
                  ICT4-{newBranch === 'BRANCH_NAGAH' ? 'N' : 'B'}-E-1
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الدورة (Course Code)</label>
                  <select
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ICT4">ICT4 (الصف الرابع الابتدائي)</option>
                    <option value="ICT5">ICT5 (الصف الخامس الابتدائي)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">اللغة (Language)</label>
                  <select
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="E">لغات (English - E)</option>
                    <option value="A">عربي (Arabic - A)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الفرع المعتمد</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as BranchId)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="BRANCH_NAGAH">فرع النجاح الرئيسي (N)</option>
                    <option value="BRANCH_BADR">فرع مدينة بدر (B)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">المدرب المشرف</label>
                  <select
                    value={newTrainerId}
                    onChange={(e) => setNewTrainerId(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    {DEMO_TRAINERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameArabic} ({t.specializationArabic})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">القاعة / المعمل (Branch Specific)</label>
                  <select
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="LAB1">معمل 1</option>
                    <option value="LAB2">معمل 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">السعة القصوى</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Conflict Radar Check preview */}
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>فحص التعارض المكاني والزمني: المعمل والمدرب متاحان بالكامل في الفرع في هذا التوقيت.</span>
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
                  celebrate('تم إنشاء المجموعة بالكود الآلي وتوليد جدول الحصص بنجاح! 📅✨');
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                حفظ واعتماد المجموعة
              </button>
            </div>
          </div>
        </div>
      )}"""

# Splitting to replace safely
if search_str in content:
    # First part before the modal, second part after the modal (the rest of the file)
    parts = content.split(search_str)
    # the second part needs to have everything after the modal end removed, but the modal is at the very end of the file.
    
    # We can just construct a safe string replacement.
    import re
    
    new_content = re.sub(
        r'\{/\* Create Group Modal \*/\}.*',
        replace_str,
        content,
        flags=re.DOTALL
    )
    
    with open('src/features/academic/GroupsManagementView.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Replaced groups modal")
else:
    print("Could not find the string to replace")
