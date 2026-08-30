const fs = require('fs');

const content = `import React, { useState, useRef } from 'react';
import { 
  CalendarCheck, 
  Printer, 
  Save, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  Wifi,
  Smartphone,
  Star,
  Trophy,
  Share2,
  Scan,
  MonitorPlay,
  Users
} from 'lucide-react';
import { Button3D } from '../../components/Button3D';
import confetti from 'canvas-confetti';

interface StudentAttendance {
  id: string;
  code: string;
  name: string;
  phone: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
  notes: string;
}

export const AttendanceDomainView: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('G1');
  const [selectedDate, setSelectedDate] = useState('2026-08-26');
  
  const [students, setStudents] = useState<StudentAttendance[]>([
    { id: '1', code: 'A121', name: 'نيروز محمد صلاح عرابي', phone: '01096932831', status: 'PRESENT', notes: '' },
    { id: '2', code: 'A122', name: 'أحمد محمود العطار', phone: '01123456789', status: null, notes: '' },
    { id: '3', code: 'A123', name: 'سارة طارق السعيد', phone: '01234567890', status: 'ABSENT', notes: 'بعذر طبي' },
    { id: '4', code: 'A124', name: 'عمر إبراهيم خليل', phone: '01555666777', status: 'LATE', notes: 'تأخير 15 دقيقة' },
  ]);

  const [isNetworkSyncActive, setIsNetworkSyncActive] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Derived Stats
  const total = students.length;
  const present = students.filter(s => s.status === 'PRESENT').length;
  const absent = students.filter(s => s.status === 'ABSENT').length;
  const late = students.filter(s => s.status === 'LATE').length;
  const excused = students.filter(s => s.status === 'EXCUSED').length;
  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const handleStatusChange = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
  };

  const simulateNetworkLogin = () => {
    // Find first student without status and mark them present as if they logged in
    const nullStudentIndex = students.findIndex(s => s.status === null);
    if (nullStudentIndex !== -1) {
      const st = students[nullStudentIndex];
      handleStatusChange(st.id, 'PRESENT');
      // Play a success sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const handleSaveAndGenerateReport = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setShowReportModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 mb-1">تسجيل الحضور والغياب اليومي</h1>
            <p className="text-[11px] text-slate-400">
              تسجيل حضور المجموعات، منح نقاط الحضور التلقائية، واحتساب نسبة الالتزام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isNetworkSyncActive ? (
            <Button3D variant="primary" onClick={() => setIsNetworkSyncActive(true)}>
              <Wifi className="w-4 h-4" />
              تفعيل الحضور الإلكتروني (الشبكة)
            </Button3D>
          ) : (
            <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/50 rounded-xl px-3 py-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-400">نظام المعمل متصل...</span>
              <button 
                onClick={simulateNetworkLogin}
                className="ml-2 bg-indigo-500 hover:bg-indigo-400 text-slate-900 text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer"
              >
                محاكاة دخول طالب
              </button>
              <button onClick={() => setIsNetworkSyncActive(false)} className="text-slate-400 hover:text-rose-400 pr-2 border-r border-indigo-500/30 mr-2 cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <Button3D variant="success" onClick={handleMarkAllPresent}>
            <CheckCircle2 className="w-4 h-4" />
            تحضير الكل كحاضر
          </Button3D>
          
          <Button3D variant="neutral" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            طباعة الكشف
          </Button3D>
          
          <Button3D variant="amber" onClick={handleSaveAndGenerateReport}>
            <Save className="w-4 h-4" />
            حفظ وإنهاء المحاضرة
          </Button3D>
        </div>
      </div>

      {/* FILTERS & STATS */}
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-4 items-end">
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-400">اختر المجموعة التدريبية:</label>
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-[#121b2f] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none"
            >
              <option value="G1">1 - P1 - ICT (قاعة 1)</option>
              <option value="G2">بايثون وبدر الذكية</option>
            </select>
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-400">تاريخ المحاضرة:</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#121b2f] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-0 border-t border-slate-800 pt-4">
          <div className="text-center border-l border-slate-800 pb-2 lg:pb-0">
            <div className="text-xs text-slate-400 mb-1">إجمالي الطلاب</div>
            <div className="text-xl font-black text-slate-200">{total}</div>
          </div>
          <div className="text-center border-l border-slate-800 pb-2 lg:pb-0">
            <div className="text-xs text-emerald-500 mb-1">حاضر</div>
            <div className="text-xl font-black text-emerald-400">{present}</div>
          </div>
          <div className="text-center border-l-0 lg:border-l border-slate-800 pb-2 lg:pb-0">
            <div className="text-xs text-rose-500 mb-1">غائب</div>
            <div className="text-xl font-black text-rose-400">{absent}</div>
          </div>
          <div className="text-center border-l border-slate-800 pt-2 lg:pt-0">
            <div className="text-xs text-amber-500 mb-1">متأخر</div>
            <div className="text-xl font-black text-amber-400">{late}</div>
          </div>
          <div className="text-center border-l border-slate-800 pt-2 lg:pt-0">
            <div className="text-xs text-blue-500 mb-1">معتذر</div>
            <div className="text-xl font-black text-blue-400">{excused}</div>
          </div>
          <div className="text-center pt-2 lg:pt-0">
            <div className="text-xs text-emerald-400 mb-1">نسبة الحضور</div>
            <div className="text-xl font-black text-emerald-400">{attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#121b2f] text-slate-400 font-bold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">م</th>
              <th className="py-3 px-4">الكود</th>
              <th className="py-3 px-4">اسم المتدرب</th>
              <th className="py-3 px-4">الهاتف</th>
              <th className="py-3 px-4 text-center">حالة الحضور</th>
              <th className="py-3 px-4">ملاحظات / سبب الغياب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {students.map((st, idx) => (
              <tr key={st.id} className="hover:bg-[#121b2f]/50 transition-colors">
                <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-500">{st.code}</td>
                <td className="py-3 px-4 font-bold text-slate-200">{st.name}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{st.phone}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 bg-[#0f172a] p-1 rounded-lg border border-slate-700 inline-flex">
                    <button
                      onClick={() => handleStatusChange(st.id, 'PRESENT')}
                      className={\`px-3 py-1 rounded-md font-bold transition-all cursor-pointer \${st.status === 'PRESENT' ? 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-emerald-500 hover:bg-emerald-500/10'}\`}
                    >
                      حاضر
                    </button>
                    <button
                      onClick={() => handleStatusChange(st.id, 'ABSENT')}
                      className={\`px-3 py-1 rounded-md font-bold transition-all cursor-pointer \${st.status === 'ABSENT' ? 'bg-rose-500 text-slate-900 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-rose-500 hover:bg-rose-500/10'}\`}
                    >
                      غائب
                    </button>
                    <button
                      onClick={() => handleStatusChange(st.id, 'LATE')}
                      className={\`px-3 py-1 rounded-md font-bold transition-all cursor-pointer \${st.status === 'LATE' ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-amber-500 hover:bg-amber-500/10'}\`}
                    >
                      متأخر
                    </button>
                    <button
                      onClick={() => handleStatusChange(st.id, 'EXCUSED')}
                      className={\`px-3 py-1 rounded-md font-bold transition-all cursor-pointer \${st.status === 'EXCUSED' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700'}\`}
                    >
                      معتذر
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={st.notes}
                    onChange={(e) => handleNotesChange(st.id, e.target.value)}
                    placeholder="ملاحظات..."
                    className="w-full bg-[#121b2f] border border-slate-700 text-slate-300 rounded px-2 py-1.5 text-xs focus:border-amber-500 outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SMART REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-black text-slate-200 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  تقرير إتمام المحاضرة
                </h2>
                <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Shareable Card Design */}
              <div id="smart-report-card" className="bg-gradient-to-br from-[#121b2f] to-[#0f172a] rounded-2xl border border-slate-700 p-6 text-center space-y-5 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
                
                <div>
                  <h3 className="text-amber-500 font-bold text-sm mb-1">مركز النجاح للتدريب والاستشارات</h3>
                  <div className="text-xs text-slate-400">تقرير محاضرة: 1 - P1 - ICT (قاعة 1)</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{selectedDate}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0b1329] p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 mb-1">نسبة الحضور</div>
                    <div className="text-xl font-black text-emerald-400">{attendanceRate}%</div>
                  </div>
                  <div className="bg-[#0b1329] p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 mb-1">النقاط الموزعة</div>
                    <div className="text-xl font-black text-amber-400">+{present * 5} XP</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-2 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  <div className="text-xs text-amber-300 font-bold mb-1">نجم المحاضرة اليوم</div>
                  <div className="text-base font-black text-white">نيروز محمد صلاح عرابي</div>
                  <div className="text-[10px] text-amber-500/70 mt-1">لحضورها المبكر والتزامها 👏</div>
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-900/50 py-2 rounded-lg">
                  تم إرسال إشعارات الحضور لأولياء الأمور بنجاح ✅
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button3D variant="success" onClick={() => alert('تمت المشاركة على واتساب!')}>
                  <Share2 className="w-4 h-4" />
                  مشاركة على واتساب
                </Button3D>
                <Button3D variant="neutral" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" />
                  طباعة التقرير
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
`
fs.writeFileSync('src/features/attendance/AttendanceDomainView.tsx', content);
