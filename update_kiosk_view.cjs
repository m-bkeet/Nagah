const fs = require('fs');

const content = `import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, CheckCircle2, UserCheck, XCircle, AlertCircle, 
  Clock, Calendar, LogOut, Loader2, Sparkles, Trophy, Star
} from 'lucide-react';

export const ElectronicAttendanceKiosk: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus hidden input for barcode scanner
  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (inputRef.current && scanState === 'IDLE') {
        inputRef.current.focus();
      }
    }, 1000);
    return () => clearInterval(focusTimer);
  }, [scanState]);

  const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const barcode = formData.get('barcode') as string;
    
    if (barcode) {
      setScanState('SCANNING');
      // Simulate API call
      setTimeout(() => {
        if (barcode === 'error') {
          setScanState('ERROR');
        } else {
          setScanState('SUCCESS');
        }
        // Reset after 4 seconds
        setTimeout(() => setScanState('IDLE'), 4000);
      }, 800);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1329] flex flex-col" dir="rtl">
      {/* Hidden input for physical barcode scanners */}
      <form onSubmit={handleScan} className="opacity-0 absolute top-0 left-0 w-0 h-0 overflow-hidden">
        <input ref={inputRef} name="barcode" type="text" autoFocus autoComplete="off" />
        <button type="submit">Scan</button>
      </form>

      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-slate-800/50 bg-[#121b2f]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-[#0b1329] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
             <Scan className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">نظام الحضور الإلكتروني</h1>
            <p className="text-slate-400 font-bold">بوابة التسجيل الذكي لمركز النجاح</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <div className="text-3xl font-black text-amber-500 font-mono tracking-wider" dir="ltr">
               {currentTime.toLocaleTimeString('en-US', { hour12: false })}
             </div>
             <div className="text-sm font-bold text-slate-400">
               {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
          <button onClick={onExit} className="p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-400 rounded-2xl transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {scanState === 'IDLE' && (
           <div className="flex flex-col items-center text-center max-w-2xl animate-in zoom-in-95 duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-amber-500/50 flex items-center justify-center relative bg-[#121b2f] shadow-2xl">
                   <Scan className="w-20 h-20 text-amber-500" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">يرجى مسح بطاقة المتدرب <br/> <span className="text-amber-500">للتسجيل</span></h2>
              <p className="text-xl text-slate-400 font-bold max-w-lg">ضع الباركود الموجود على بطاقتك أمام الماسح الضوئي لتسجيل حضورك للمحاضرة وتفعيل جهازك.</p>
           </div>
        )}

        {scanState === 'SCANNING' && (
           <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
              <Loader2 className="w-24 h-24 text-amber-500 animate-spin mb-6" />
              <h2 className="text-3xl font-black text-white">جاري التحقق من البيانات...</h2>
           </div>
        )}

        {scanState === 'SUCCESS' && (
           <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
              {/* Success Message & Controls */}
              <div className="flex flex-col justify-center text-center md:text-right">
                 <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 mx-auto md:mx-0 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h2 className="text-5xl font-black text-white mb-4">أهلاً بك يا بطل!</h2>
                 <p className="text-2xl text-emerald-400 font-bold mb-8">تم تسجيل حضورك بنجاح</p>
                 
                 <div className="space-y-4 text-slate-300 font-bold bg-[#121b2f]/50 p-6 rounded-3xl border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                       <Clock className="w-6 h-6 text-emerald-500" />
                       <span className="text-lg">وقت الدخول: <span className="font-mono text-white" dir="ltr">{currentTime.toLocaleTimeString('en-US', {hour12: false})}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                       <UserCheck className="w-6 h-6 text-emerald-500" />
                       <span className="text-lg">تم إرسال إشعار الدخول لولي الأمر.</span>
                    </div>
                    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-700/50">
                       <Sparkles className="w-6 h-6 text-amber-500" />
                       <span className="text-lg text-amber-400">حصلت على 5 نقاط حضور جديدة!</span>
                    </div>
                 </div>
              </div>

              {/* Student ID Card Preview */}
              <div className="flex items-center justify-center">
                 <div className="w-full max-w-sm bg-gradient-to-br from-[#1a233a] to-[#0b1329] border-2 border-emerald-500/50 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transform rotate-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px]"></div>
                    
                    <div className="text-center mb-6 relative z-10">
                       <div className="w-32 h-32 mx-auto rounded-full border-4 border-emerald-500/30 overflow-hidden mb-4 shadow-xl">
                          <img src="https://i.pravatar.cc/300?img=11" alt="Student" className="w-full h-full object-cover" />
                       </div>
                       <h3 className="text-2xl font-black text-white">نيروز محمد صلاح</h3>
                       <p className="text-emerald-400 font-bold mt-1">طالب متميز - ICT-P1</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                       <div className="bg-[#121b2f] p-3 rounded-2xl text-center border border-slate-700">
                          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-400">النقاط</div>
                          <div className="text-lg font-black text-white font-mono">1,250</div>
                       </div>
                       <div className="bg-[#121b2f] p-3 rounded-2xl text-center border border-slate-700">
                          <Star className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-400">المستوى</div>
                          <div className="text-lg font-black text-white">المتقدم</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {scanState === 'ERROR' && (
           <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                 <XCircle className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">فشل التسجيل!</h2>
              <p className="text-xl text-rose-400 font-bold max-w-lg mb-8">عذراً، البطاقة غير صالحة أو المتدرب غير مسجل في أي محاضرة جارية الآن.</p>
              <div className="bg-rose-950/40 border border-rose-900 p-4 rounded-2xl flex items-center gap-3 text-rose-200">
                 <AlertCircle className="w-6 h-6 shrink-0" />
                 <span>يرجى مراجعة الإدارة للتحقق من المواعيد وحالة الاشتراك.</span>
              </div>
           </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center text-slate-500 text-xs font-bold border-t border-slate-800/50">
         تم تطوير النظام بواسطة مركز النجاح • {new Date().getFullYear()}
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/features/academic/ElectronicAttendanceKiosk.tsx', content);
