const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

const oldTableRegex = /<table className="w-full text-right text-xs">.*?<\/table>/s;

const newTable = `<table className="w-full text-right text-xs border-separate" style={{ borderSpacing: '0 8px' }}>
            <thead className="bg-[#0f172a]/70 backdrop-blur-md text-slate-400 font-bold">
              <tr>
                <th className="pb-3 px-3 text-center w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="pb-3 px-3">المتدرب</th>
                <th className="pb-3 px-3">الفرع</th>
                <th className="pb-3 px-3">الدورة والمجموعة</th>
                <th className="pb-3 px-3">بيانات الاتصال</th>
                <th className="pb-3 px-3 text-center">الماليات</th>
                <th className="pb-3 px-3 text-center">الإنجاز</th>
                <th className="pb-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-bold bg-[#0b1329] rounded-xl border border-slate-800">
                    لا يوجد متدربون يطابقون معايير البحث
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isChecked = selectedIds.includes(st.id);
                  return (
                    <tr 
                      key={st.id} 
                      className={\`group transition-all \${
                        isChecked ? 'bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#121b2f] hover:bg-[#152037] shadow-sm'
                      }\`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center rounded-r-xl border-y border-r border-slate-800/80 group-hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(st.id)}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Student Profile Col */}
                      <td className="py-3 px-3 border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${st.id}&backgroundColor=0b1120&clothing=blazerAndShirt\`}
                              alt={st.name}
                              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121b2f]" />
                          </div>
                          <div>
                            <button
                              onClick={() => setViewStudent(st)}
                              className="font-black text-slate-200 hover:text-amber-400 text-sm transition-colors cursor-pointer text-right block leading-tight"
                            >
                              {st.name}
                            </button>
                            <span className="text-[10px] text-amber-500 font-mono tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                              {st.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-3 border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{st.branchLabel}</span>
                        </div>
                      </td>

                      {/* Course / Group */}
                      <td className="py-3 px-3 border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="font-bold text-slate-200 text-xs mb-1">{st.course}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {st.group}
                        </div>
                      </td>

                      {/* Contact Data */}
                      <td className="py-3 px-3 border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="space-y-1">
                          <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500"/> {st.phone}</div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5"><Phone className="w-3 h-3 text-amber-500/50"/> {st.parentPhone}</div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-3 text-center border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="text-xs font-black text-slate-200">{st.paid} <span className="text-[9px] text-slate-500">من</span> {st.fees}</div>
                          {st.balance > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                              متبقي {st.balance} ج.م
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                              خالص ✓
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Achievements */}
                      <td className="py-3 px-3 text-center border-y border-slate-800/80 group-hover:border-slate-700">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => handleAwardStar(st.id)} title="منح نجمة">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="font-black text-amber-400 text-xs">{st.stars}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">{st.points} XP</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center rounded-l-xl border-y border-l border-slate-800/80 group-hover:border-slate-700">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button onClick={() => setViewStudent(st)} className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors" title="الملف الشامل">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setIdCardStudent(st)} className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors" title="البطاقة الذكية">
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSendWhatsAppDirect(st.parentPhone, st.name)} className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="واتساب">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => setAiReportStudent(st)} className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors" title="تحليل AI">
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button onClick={() => alert(\`تعديل بيانات: \${st.name}\`)} className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors" title="تعديل">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSingle(st.id, st.name)} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>`;

content = content.replace(oldTableRegex, newTable);
fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);

