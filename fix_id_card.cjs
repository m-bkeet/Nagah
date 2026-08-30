const fs = require('fs');
let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

const idCardCommentStart = content.indexOf('{/* MODAL 2: STUDENT ID CARD PRINTABLE */}');
const idCardCommentEnd = content.indexOf('{/* MODAL 3: EXCEL IMPORT & EXPORT */}');

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
                    <button onClick={() => setIdCardStudent(null)} className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl transition-all cursor-pointer">
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
                    <button onClick={() => window.print()} className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0b1329] py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1 cursor-pointer">
                       <Printer className="w-5 h-5" />
                       طباعة البطاقة
                    </button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 border border-slate-600 transition-all transform hover:-translate-y-1 cursor-pointer">
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
    fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);
    console.log("Updated StudentDomainView.tsx successfully with ID Card");
} else {
    console.error("Could not find id card modal block. Start: ", idCardCommentStart, "End: ", idCardCommentEnd);
}
