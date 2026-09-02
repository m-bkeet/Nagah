import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');

const modals = `
      {/* Show Trainees Modal */}
      {viewingTraineesGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl text-right flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>متدربين مجموعة: {viewingTraineesGroup.name}</span>
              </h3>
              <button onClick={() => setViewingTraineesGroup(null)} className="text-slate-500 hover:text-slate-300">
                إغلاق
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {((window as any).allTrainees || []).filter((t: any) => t.groupId === viewingTraineesGroup.id).length === 0 ? (
                <div className="text-slate-500 text-center py-8 text-xs">لا يوجد متدربين في هذه المجموعة</div>
              ) : (
                ((window as any).allTrainees || []).filter((t: any) => t.groupId === viewingTraineesGroup.id).map((t: any, idx: number) => (
                  <div key={t.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">{idx + 1}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{t.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.code}</div>
                      </div>
                    </div>
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                      {t.phone}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-right">
            <h3 className="text-base font-black text-slate-100 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" />
              <span>تعديل بيانات المجموعة: {editingGroup.name}</span>
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const fd = new FormData(e.currentTarget);
                const days = fd.getAll('scheduleDays');
                const updated = {
                  ...editingGroup,
                  branchId: fd.get('branchId') as string,
                  trainerId: fd.get('trainerId') as string,
                  roomName: fd.get('roomName') as string,
                  startTime: fd.get('startTime') as string,
                  endTime: fd.get('endTime') as string,
                  scheduleDays: days.length ? days : editingGroup.scheduleDays
                };
                
                const res = await fetch(\`/api/groups/\${editingGroup.id}\`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated)
                });
                
                if (res.ok) {
                  setEditingGroup(null);
                  fetchSchedules(); // refresh
                } else {
                  alert('حدث خطأ أثناء الحفظ');
                }
              } catch(err) {
                console.error(err);
              }
            }} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">الفرع</label>
                <select name="branchId" defaultValue={editingGroup.branchId} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200">
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المدرب</label>
                <select name="trainerId" defaultValue={editingGroup.trainerId} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200">
                  <option value="">-- غير محدد --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name || t.fullName}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">المعمل / القاعة</label>
                <input name="roomName" type="text" defaultValue={editingGroup.roomName || (editingGroup as any).hallName} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">وقت البدء</label>
                  <input name="startTime" type="time" defaultValue={editingGroup.startTime || (editingGroup as any).scheduleTime || '16:00'} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">وقت الانتهاء</label>
                  <input name="endTime" type="time" defaultValue={editingGroup.endTime || '18:00'} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 font-bold mb-2">أيام المحاضرات</label>
                <div className="flex flex-wrap gap-2">
                  {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => (
                    <label key={d} className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer hover:border-indigo-500/50">
                      <input type="checkbox" name="scheduleDays" value={d} defaultChecked={(editingGroup.scheduleDays || editingGroup.days || []).includes(d)} className="accent-indigo-500" />
                      <span className="text-slate-300">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingGroup(null)} className="px-4 py-2 text-slate-400 hover:text-slate-200">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20">
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

code = code.replace(/    \<\/div\>\n  \);\n\};/, `${modals}\n    </div>\n  );\n};`);
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
