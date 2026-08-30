const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

// 1. Replace the Table (List View) block. We'll search for the table tag
const tableStartIdx = content.indexOf('<table className="w-full text-right text-xs border-separate"');
const tableEndIdx = content.indexOf('</table>') + '</table>'.length;

const newTable = `
          <div className="bg-[#0b1329] border border-slate-700/80 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
            <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#121b2f] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5 text-center w-12">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="py-4 px-5">بيانات المتدرب</th>
                  <th className="py-4 px-5">الفرع التعليمي</th>
                  <th className="py-4 px-5">البرنامج والمجموعة</th>
                  <th className="py-4 px-5">بيانات التواصل</th>
                  <th className="py-4 px-5 text-center">الوضع المالي</th>
                  <th className="py-4 px-5 text-center">التميز</th>
                  <th className="py-4 px-5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-4">
                         <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50">
                           <Search className="w-10 h-10 text-slate-600" />
                         </div>
                         <div className="font-bold text-lg">لا يوجد متدربون يطابقون معايير البحث</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const isChecked = selectedIds.includes(st.id);
                    return (
                      <tr 
                        key={st.id} 
                        className={\`group transition-all hover:bg-[#152037]/80 \${
                          isChecked ? 'bg-amber-900/10' : 'bg-transparent'
                        }\`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(st.id)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4 transition-transform hover:scale-110"
                          />
                        </td>

                        {/* Student Profile Col */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-4">
                            <div className="relative group-hover:scale-105 transition-transform duration-300">
                              <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <img 
                                src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${st.id}&backgroundColor=0b1120&clothing=blazerAndShirt\`}
                                alt={st.name}
                                className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-amber-500 bg-slate-900 shadow-md relative z-10 transition-colors"
                              />
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#121b2f] z-20 shadow-sm" />
                            </div>
                            <div>
                              <button
                                onClick={() => setViewStudent(st)}
                                className="font-black text-slate-200 hover:text-amber-400 text-base transition-colors cursor-pointer text-right block leading-tight mb-1"
                              >
                                {st.name}
                              </button>
                              <span className="text-[11px] text-amber-500 font-mono tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block shadow-sm">
                                {st.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="py-4 px-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs font-bold text-slate-300 shadow-sm group-hover:bg-slate-800/80 transition-colors">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>{st.branchLabel}</span>
                          </div>
                        </td>

                        {/* Course / Group */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-200 text-sm mb-1 group-hover:text-amber-50 transition-colors">{st.course}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/30 w-fit px-2 py-0.5 rounded-md border border-slate-700/30">
                            <Users className="w-3.5 h-3.5" /> {st.group}
                          </div>
                        </td>

                        {/* Contact Data */}
                        <td className="py-4 px-5">
                          <div className="space-y-2">
                            <div className="text-xs font-mono text-slate-300 flex items-center gap-2 bg-slate-800/20 px-2 py-1 rounded-md border border-slate-700/30 w-fit">
                              <Phone className="w-3.5 h-3.5 text-blue-400"/> 
                              {st.phone}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 bg-slate-800/20 px-2 py-1 rounded-md border border-slate-700/30 w-fit">
                              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400/70"/> 
                              {st.parentPhone}
                            </div>
                          </div>
                        </td>

                        {/* Financials */}
                        <td className="py-4 px-5 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-sm font-black text-slate-200">
                              {st.paid} <span className="text-[10px] text-slate-500 font-normal">من</span> {st.fees}
                            </div>
                            {st.balance > 0 ? (
                              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 font-bold text-[10px] border border-rose-500/20 flex items-center gap-1 shadow-sm">
                                <AlertCircle className="w-3 h-3" /> متبقي {st.balance} ج.م
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" /> خالص
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Achievements */}
                        <td className="py-4 px-5 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <button 
                                onClick={() => handleAwardStar(st.id)} 
                                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-amber-500 hover:scale-105 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all group/star" 
                                title="منح نجمة"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover/star:text-[#0b1329] group-hover/star:fill-[#0b1329]" />
                              <span className="font-black text-amber-500 text-sm group-hover/star:text-[#0b1329]">{st.stars}</span>
                            </button>
                            <div className="text-[10px] text-slate-400 font-mono bg-slate-800/40 px-2 py-0.5 rounded-full border border-slate-700/50">{st.points} XP</div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <button onClick={() => setViewStudent(st)} className="p-2 rounded-xl bg-[#1e293b] hover:bg-blue-500 border border-slate-700 hover:border-blue-400 text-slate-400 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:-translate-y-0.5" title="الملف الشامل">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIdCardStudent(st)} className="p-2 rounded-xl bg-[#1e293b] hover:bg-indigo-500 border border-slate-700 hover:border-indigo-400 text-slate-400 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-0.5" title="البطاقة الذكية">
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleSendWhatsAppDirect(st.parentPhone, st.name)} className="p-2 rounded-xl bg-[#1e293b] hover:bg-emerald-500 border border-slate-700 hover:border-emerald-400 text-slate-400 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5" title="واتساب">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => setAiReportStudent(st)} className="p-2 rounded-xl bg-[#1e293b] hover:bg-amber-500 border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-[#0b1329] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:-translate-y-0.5" title="تحليل AI">
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
`;

if (tableStartIdx > -1 && tableEndIdx > -1) {
    content = content.substring(0, tableStartIdx) + newTable + content.substring(tableEndIdx);
} else {
    console.error("Could not find table");
}

// 2. Add lucide import for AlertCircle if missing
if (!content.includes('AlertCircle')) {
    content = content.replace('Menu, Grid, Clock}', 'Menu, Grid, Clock, AlertCircle}');
}

// 3. Replace Profile and ID Card Modals. We'll find from `{viewStudent && (` to the end of `{aiReportStudent && (`
// Wait, the idCardStudent block is smaller, let's just replace from `{idCardStudent && (` to `)}` after the modal block.
const idCardStartIdx = content.indexOf('{idCardStudent && (');
// we need to find the matching closing braces.
// Let's just use string slicing carefully by counting brackets or using regex.
// Actually, it's safer to just split by the comment `/* MODAL 2: STUDENT ID CARD PRINTABLE */` to `/* MODAL 3:`
const idCardCommentStart = content.indexOf('{/* MODAL 2: STUDENT ID CARD PRINTABLE */}');
const idCardCommentEnd = content.indexOf('{/* MODAL 3: AI REPORT MODAL */}');

const newIdCard = `
      {/* MODAL 2: STUDENT ID CARD PRINTABLE */}
      {/* ========================================================================= */}
      {idCardStudent && (
        <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
            
            {/* Left Side: Controls & Info */}
            <div className="flex flex-col justify-center order-2 md:order-1">
               <div className="bg-[#121b2f] p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">البطاقة الذكية للمتدرب</h2>
                        <p className="text-slate-400 font-bold">ملف إنجاز وبطاقة مرور للمركز</p>
                    </div>
                    <button onClick={() => setIdCardStudent(null)} className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="space-y-4 mb-8 relative z-10">
                    <div className="bg-[#0b1329] p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
                          <Bot className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-white text-sm">بصمة الذكاء الاصطناعي</h4>
                          <p className="text-xs text-slate-400">البطاقة مدعومة بتوليد الـ QR ديناميكياً</p>
                       </div>
                    </div>
                    <div className="bg-[#0b1329] p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                       <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center border border-amber-500/30">
                          <Star className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-white text-sm">حائط الإنجازات</h4>
                          <p className="text-xs text-slate-400">سجل حافل بالتميز والمشاركات الفعالة</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 relative z-10">
                    <button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0b1329] py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1">
                       <Printer className="w-5 h-5" />
                       طباعة البطاقة
                    </button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 border border-slate-600 transition-all transform hover:-translate-y-1">
                       <Download className="w-5 h-5" />
                       تحميل كصورة
                    </button>
                 </div>
               </div>
            </div>

            {/* Right Side: ID Card Visual */}
            <div className="flex justify-center order-1 md:order-2">
                <div id="student-smart-card" className="w-[380px] bg-gradient-to-br from-[#1a233a] via-[#121b2f] to-[#080d1a] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-slate-700/50 relative overflow-hidden transform transition-transform duration-500 hover:rotate-1 hover:scale-105">
                    {/* Glowing Accents */}
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/30 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
                    
                    {/* Tech Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-700/50 pb-4 mb-6 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                              <Building2 className="w-6 h-6 text-[#0b1329]" />
                           </div>
                           <div>
                              <h3 className="text-amber-500 font-black text-sm leading-tight">مركز النجاح</h3>
                              <p className="text-[10px] text-slate-400 tracking-wider">للتدريب والاستشارات</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">ID Number</div>
                           <div className="font-mono text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-600 text-xs tracking-wider">{idCardStudent.code}</div>
                        </div>
                    </div>

                    {/* Profile Area */}
                    <div className="flex flex-col items-center mb-6 relative z-10">
                        <div className="relative mb-4 group">
                           <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                           <img 
                              src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${idCardStudent.id}&backgroundColor=0b1120&clothing=blazerAndShirt\`} 
                              alt="Student" 
                              className="w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-900 shadow-2xl relative z-10 object-cover"
                           />
                           <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-emerald-500 text-[#0b1120] text-[10px] font-black px-3 py-1 rounded-full border-2 border-[#0b1120] flex items-center gap-1 z-20 shadow-lg whitespace-nowrap">
                              <ShieldCheck className="w-3.5 h-3.5"/> متدرب معتمد
                           </div>
                        </div>
                        
                        <h2 className="text-2xl font-black text-white text-center drop-shadow-md mb-1">{idCardStudent.name}</h2>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                           <GraduationCap className="w-4 h-4 text-indigo-400" />
                           <span className="text-indigo-300 text-xs font-bold">{idCardStudent.course} • {idCardStudent.group}</span>
                        </div>
                    </div>

                    {/* Achievements Wall Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                        <div className="bg-[#0b1329]/80 border border-slate-700/50 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                           <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                              <Star className="w-5 h-5 text-amber-500" />
                           </div>
                           <div>
                              <div className="text-[10px] text-slate-400">نقاط التميز</div>
                              <div className="text-lg font-black text-amber-400 font-mono leading-none">{idCardStudent.points}</div>
                           </div>
                        </div>
                        <div className="bg-[#0b1329]/80 border border-slate-700/50 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                              <Award className="w-5 h-5 text-blue-400" />
                           </div>
                           <div>
                              <div className="text-[10px] text-slate-400">التقييم</div>
                              <div className="text-lg font-black text-blue-400 leading-none">متقدم</div>
                           </div>
                        </div>
                    </div>

                    {/* QR Code Container with Image Center */}
                    <div className="bg-white p-3 rounded-3xl mx-auto w-fit shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
                        <QRCodeSVG 
                           value={\`https://nagah.center/verify/\${idCardStudent.code}\`} 
                           size={120}
                           level="H"
                           imageSettings={{
                             src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='20' x='4' y='2' rx='2' ry='2'/%3E%3Cpath d='M9 22v-4h6v4'/%3E%3Cpath d='M8 6h.01'/%3E%3Cpath d='M16 6h.01'/%3E%3Cpath d='M12 6h.01'/%3E%3Cpath d='M12 10h.01'/%3E%3Cpath d='M12 14h.01'/%3E%3Cpath d='M16 10h.01'/%3E%3Cpath d='M16 14h.01'/%3E%3Cpath d='M8 10h.01'/%3E%3Cpath d='M8 14h.01'/%3E%3C/svg%3E",
                             x: undefined,
                             y: undefined,
                             height: 30,
                             width: 30,
                             excavate: true,
                           }}
                        />
                    </div>
                    <div className="text-center mt-3 relative z-10 text-[9px] text-slate-500">
                        للتسجيل الذاتي عبر البوابات الإلكترونية
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
      
`;

if (idCardCommentStart > -1 && idCardCommentEnd > -1) {
    content = content.substring(0, idCardCommentStart) + newIdCard + content.substring(idCardCommentEnd);
} else {
    console.error("Could not find id card modal block");
}


// Replace the Profile Modal Buttons in Profile View to have the new 3D style
// Inside Profile Modal Section 1: Top info card
const profileModalStartIdx = content.indexOf('{/* --- PROFILE MODAL --- */}');
if (profileModalStartIdx > -1) {
  // Let's do some surgical replacement in the profile modal buttons
  content = content.replace(
      '<button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-900/20 active:scale-95">',
      '<button onClick={() => { setIdCardStudent(viewStudent); setViewStudent(null); }} className="bg-amber-500 hover:bg-amber-400 text-[#0b1329] px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 border border-amber-400">'
  );
}

fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);
console.log("Updated StudentDomainView.tsx successfully.");
