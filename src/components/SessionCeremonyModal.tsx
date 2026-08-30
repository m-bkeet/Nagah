import React, { useState, useEffect } from 'react';
import { Trainee, Group } from '../types';
import { api, request } from '../services/api';
import { Trophy, Award, Star, Sparkles, X, Volume2, Flame, Crown, PartyPopper } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SessionCeremonyModalProps {
  trainees: Trainee[];
  groups: Group[];
  onClose: () => void;
  onAwardBonus: (traineeId: string, points: number, reason: string) => void;
}

export const SessionCeremonyModal: React.FC<SessionCeremonyModalProps> = ({
  trainees,
  groups,
  onClose,
  onAwardBonus,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sessionName, setSessionName] = useState<string>('محاضرة المعمل الذكي وتطوير التطبيقات');
  const [ceremonyStep, setCeremonyStep] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Filter trainees for the ceremony
  const eligibleTrainees = trainees
    .filter(t => selectedGroup === 'all' || t.groupId === selectedGroup)
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const top3 = eligibleTrainees.slice(0, 3);
  // Reorder for podium: [2nd (index 1), 1st (index 0), 3rd (index 2)] if available
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  useEffect(() => {
    return () => {
      audioService.stopAll();
    };
  }, []);

  const handleCloseModal = () => {
    audioService.stopAll();
    onClose();
  };

  const playChime = (freqs: number[]) => {
    if (isMuted) return;
    audioService.playChime(freqs);
  };

  const speakText = async (text: string) => {
    if (isMuted) return;
    await audioService.speakText(text);
  };

  const startCeremony = async () => {
    if (top3.length === 0) return;
    setCeremonyStep(1); // Reveal 3rd
    playChime([440, 554.37, 659.25]);
    if (top3[2]) {
      speakText(`يا جماعة معانا النهاردة في المركز التالت البطل اللي منورنا، ${top3[2].fullName}! وحش بجد وعمل مجهود جبار، سقفوله يا شباب!`);
    }

    // Force instant broadcast to all students
    try {
      await api.broadcastCeremony({
        step: 1,
        top3,
        sessionName,
        isStarting: true
      });
      // Also notify devices specifically for full screen
      await request('/devices/force-ceremony', { method: 'POST', body: JSON.stringify({ active: true }) });
    } catch (e) {
      console.error('Broadcast failed:', e);
    }
  };

  const nextStep = async () => {
    if (ceremonyStep === 1) {
      setCeremonyStep(2); // Reveal 2nd
      playChime([523.25, 659.25, 783.99]);
      if (top3[1]) {
        speakText(`ودلوقتي.. المركز التاني اللي كسر الدنيا النهاردة.. البرنس ${top3[1].fullName}! إيه الحلاوة دي يا بطل، برافو عليك جداً!`);
      }
      try { await api.broadcastCeremony({ step: 2, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 2) {
      setCeremonyStep(3); // Reveal 1st (Champion)
      playChime([523.25, 659.25, 783.99, 1046.5]);
      if (top3[0]) {
        speakText(`وصلنا للحظة اللي الكل مستنيها.. بطل النهاردة اللي مفيش زيه، النجم اللي رفع التاج وخد المركز الأول هووو.. ${top3[0].fullName}! مبروك يا أسطورة، أنت النهاردة ملك القاعة!`);
      }
      try { await api.broadcastCeremony({ step: 3, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 3) {
      setCeremonyStep(4); // Finished ceremony
      try { 
        await api.broadcastCeremony({ step: 4, top3, sessionName, isFinished: true });
        await request('/devices/force-ceremony', { method: 'POST', body: JSON.stringify({ active: false }) });
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto" dir="rtl">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-500/50 rounded-3xl shadow-2xl max-w-3xl w-full p-6 text-slate-100 relative overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
                حفل تتويج وعرض نجوم الجلسة الأسطوري 🏆
              </h2>
              <p className="text-xs text-slate-300">
                منصة تكريم الأبطال الأوائل بحماس وتصفيق ومؤثرات صوتية تفاعلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                isMuted ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ceremony Content */}
        <div className="py-6 space-y-6 relative z-10">
          {ceremonyStep === 0 && (
            <div className="space-y-5 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                <Sparkles className="w-10 h-10 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-100">اختر الجلسة أو المجموعة لبدء التتويج التشويقي</h3>
                <p className="text-xs text-slate-400">سيتم عرض المراكز الثلاثة الأولى تصاعدياً من الثالث إلى الأول مع نطق الأسماء وتشجيع حماسي.</p>
              </div>

              <div className="space-y-3 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">فلترة حسب المجموعة / الجلسة:</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                  >
                    <option value="all">جميع المجموعات (الترتيب العام للمركز)</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المحاضرة أو الجلسة الحالية:</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold"
                  />
                </div>
              </div>

              {top3.length === 0 ? (
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-bold">
                  ⚠️ لا يوجد متدربون لديهم نقاط في هذه المجموعة حتى الآن. أضف بعض النقاط أولاً لتبدأ الحفل!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCeremony}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  <PartyPopper className="w-5 h-5" />
                  <span>بدء حفل إظهار نجوم الجلسة والتشويق 🚀</span>
                </button>
              )}
            </div>
          )}

          {ceremonyStep > 0 && (
            <div className="space-y-6">
              {/* Session Title Badge */}
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-inner">
                  🌟 حفل تتويج: {sessionName}
                </span>
              </div>

              {/* Podium Stage */}
              <div className="grid grid-cols-3 gap-3 items-end pt-8 min-h-[300px]">
                {/* 2nd Place (Silver) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  {top3[1] && (
                    <div className="bg-gradient-to-b from-slate-700/80 to-slate-800 border-2 border-slate-400/80 rounded-2xl p-4 text-center shadow-xl relative space-y-3">
                      <div className="absolute -top-6 right-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-slate-300 border-2 border-slate-100 flex items-center justify-center font-black text-slate-950 shadow-md">
                        🥈
                      </div>
                      <div className="pt-3">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">المركز الثاني</span>
                        <h4 className="font-black text-sm text-slate-100 mt-1 truncate">{top3[1].fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top3[1].code}</p>
                      </div>
                      <div className="bg-slate-900/80 py-2 px-3 rounded-xl border border-slate-700">
                        <span className="font-black text-slate-200 text-sm font-mono">{top3[1].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block">نقطة تميز</span>
                      </div>
                      <div className="text-xs bg-slate-700/50 py-1 rounded-lg text-slate-200 font-bold">
                        وسام الفضة 🥈
                      </div>
                    </div>
                  )}
                </div>

                {/* 1st Place (Gold Champion - Center & Tallest) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 3 ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-16'}`}>
                  {top3[0] && (
                    <div className="bg-gradient-to-b from-amber-500/30 via-slate-900 to-amber-950/60 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl relative space-y-3 ring-4 ring-amber-500/20">
                      <div className="absolute -top-8 right-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center font-black text-slate-950 shadow-xl animate-bounce">
                        <Crown className="w-8 h-8 text-slate-950" />
                      </div>
                      <div className="pt-4">
                        <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">🥇 بطل الجلسة الأول</span>
                        <h3 className="font-black text-base text-white mt-1">{top3[0].fullName}</h3>
                        <p className="text-[11px] text-amber-200/80 font-mono mt-0.5">كود: {top3[0].code}</p>
                      </div>
                      <div className="bg-slate-950/80 py-2.5 px-4 rounded-xl border border-amber-500/50">
                        <span className="text-2xl font-black text-amber-400 font-mono">{top3[0].points || 0}</span>
                        <span className="text-[11px] text-amber-300 block font-bold">نقطة تميز أسطورية</span>
                      </div>
                      <div className="text-xs bg-amber-500/20 border border-amber-500/40 py-1.5 rounded-lg text-amber-300 font-black animate-pulse">
                        🌟 نجم المحاضرة الذهبي ودرع التميز
                      </div>
                    </div>
                  )}
                </div>

                {/* 3rd Place (Bronze) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  {top3[2] && (
                    <div className="bg-gradient-to-b from-amber-900/40 to-slate-900 border-2 border-amber-700/80 rounded-2xl p-4 text-center shadow-xl relative space-y-3">
                      <div className="absolute -top-6 right-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-amber-700 border-2 border-amber-300 flex items-center justify-center font-black text-white shadow-md">
                        🥉
                      </div>
                      <div className="pt-3">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">المركز الثالث</span>
                        <h4 className="font-black text-sm text-slate-100 mt-1 truncate">{top3[2].fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top3[2].code}</p>
                      </div>
                      <div className="bg-slate-900/80 py-2 px-3 rounded-xl border border-slate-700">
                        <span className="font-black text-amber-600 text-sm font-mono">{top3[2].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block">نقطة تميز</span>
                      </div>
                      <div className="text-xs bg-amber-950/60 py-1 rounded-lg text-amber-300 font-bold">
                        وسام البرونز 🥉
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ceremony Controls / Next Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCeremonyStep(0)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  إعادة ضبط الحفل
                </button>

                {ceremonyStep < 3 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <span>{ceremonyStep === 1 ? 'إعلان المركز الثاني 🥈' : 'إعلان البطل الأول والتاج 👑'}</span>
                  </button>
                )}

                {ceremonyStep >= 3 && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <span>إنهاء الحفل وحفظ التتويج 🎉</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
