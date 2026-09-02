import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');

const regex = /\<div className="flex items-start justify-between gap-2"\>[\s\S]*?\<\/button\>\n                          \<\/div\>/;
const newSlot = `<div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {formatTimeAMPM(slot.startTime)} - {formatTimeAMPM(slot.endTime)}
                              </span>
                              <h4 className="font-bold text-xs text-slate-100 mt-1.5">{slot.groupName}</h4>
                              <p className="text-[11px] text-indigo-300 mt-0.5">{slot.courseName}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-all">
                              <button
                                onClick={() => {
                                  const group = groups.find(g => g.id === slot.groupId);
                                  if (group) setViewingTraineesGroup(group);
                                }}
                                className="p-1 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded transition-all"
                                title="عرض المتدربين"
                              >
                                <Users className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const group = groups.find(g => g.id === slot.groupId);
                                  if (group) setEditingGroup(group);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded transition-all"
                                title="تعديل بيانات الجدول"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>`;
code = code.replace(regex, newSlot);
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
