import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');

const regex = /\<button\n\s*onClick=\{\(\) \=\> handleDeleteSlot\(slot.id\)\}[\s\S]*?\<\/button\>/;
const newButtons = `<div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          const group = groups.find(g => g.id === slot.groupId);
                                          if (group) setViewingTraineesGroup(group);
                                        }}
                                        className="p-1 text-slate-400 hover:text-emerald-400 transition-all rounded hover:bg-slate-800"
                                        title="عرض المتدربين"
                                      >
                                        <Users className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const group = groups.find(g => g.id === slot.groupId);
                                          if (group) setEditingGroup(group);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-400 transition-all rounded hover:bg-slate-800"
                                        title="تعديل بيانات الجدول"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>`;
code = code.replace(regex, newButtons);
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
