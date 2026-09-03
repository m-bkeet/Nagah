import React, { useState, useEffect } from 'react';
import { X, Star, Users, Search, Target, Zap, ShieldCheck, CheckSquare, Square, Award } from 'lucide-react';
import { api } from '../services/api';
import { Trainee, Group } from '../types';

interface FloatingPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingPointsModal: React.FC<FloatingPointsModalProps> = ({ isOpen, onClose }) => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [pointsToGive, setPointsToGive] = useState(10);
  const [reason, setReason] = useState('مشاركة متميزة وإجابة صحيحة في الحصة');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, gData] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getGroups().catch(() => [])
      ]);
      const safeTrainees = Array.isArray(tData) ? tData : [];
      setTrainees(safeTrainees);
      setGroups(Array.isArray(gData) ? gData : []);
      // Default selection: all trainees or empty
      setSelectedTraineeIds(safeTrainees.map(t => t.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = trainees.filter(t => {
    const matchesSearch = 
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || t.groupId === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const toggleSelectAll = () => {
    if (selectedTraineeIds.length === filtered.length) {
      setSelectedTraineeIds([]);
    } else {
      setSelectedTraineeIds(filtered.map(t => t.id));
    }
  };

  const toggleTrainee = (id: string) => {
    setSelectedTraineeIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGivePoints = async () => {
    if (selectedTraineeIds.length === 0) return;
    try {
      await api.addPoints({
        traineeIds: selectedTraineeIds,
        points: pointsToGive,
        reason: reason || 'مشاركة متميزة وتفاعل في الشرح'
      });
      
      const msg = `🎉 تم منح ${pointsToGive > 0 ? '+' : ''}${pointsToGive} نقطة لعدد ${selectedTraineeIds.length} طالب بنجاح!`;
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(msg, 'success');
      } else {
        alert(msg);
      }
      
      onClose();
    } catch (err) {
      console.error('Error awarding points:', err);
      const errToast = 'تعذر منح النقاط، تأكد من اتصال السيرفر';
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(errToast, 'error');
      } else {
        alert(errToast);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={onClose} dir="rtl">
      <div 
        className="bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 flex items-center gap-2">
                <span>نظام منح النقاط الجماعي والفردي</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  تفاعل مباشر ⚡
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">امنح النقاط لطلابك أو للمجموعة بضغطة واحدة من أي شاشة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Group & Search controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedGroupFilter}
                onChange={e => setSelectedGroupFilter(e.target.value)}
                className="bg-transparent text-amber-300 font-bold w-full focus:outline-none"
              >
                <option value="all">جميع المجموعات ({trainees.length})</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Select All Header */}
          <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-amber-300 font-bold hover:text-amber-200"
            >
              {selectedTraineeIds.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>تحديد جميع الطلاب ({filtered.length})</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              المحدد حالياً: {selectedTraineeIds.length} طالب
            </span>
          </div>

          {/* Student List */}
          <div className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-y-auto max-h-[200px] p-2 space-y-1">
            {loading ? (
              <p className="text-center py-4 text-slate-500 text-xs">جاري جلب قائمة الطلاب...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs">لا يوجد طلاب مطابقون للبحث</p>
            ) : (
              filtered.map(t => {
                const isChecked = selectedTraineeIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTrainee(t.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isChecked 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">{t.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">كود: {t.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black">{t.totalPoints || t.points || 0}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Points config */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl space-y-3">
            <div>
              <label className="text-xs font-bold text-amber-300 block mb-1.5">كم نقطة تريد منحها / خصمها؟</label>
              <div className="grid grid-cols-6 gap-1.5">
                {[5, 10, 15, 20, 50, -5].map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPointsToGive(pt)}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                      pointsToGive === pt 
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105' 
                        : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border-amber-500/30'
                    }`}
                  >
                    {pt > 0 ? `+${pt}` : pt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">سبب المنح / التميز:</label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {['إجابة ممتازة وتسريع الكود', 'إتمام المهمة البرمجية', 'مساعدة الزملاء', 'الانضباط والهدوء'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                      reason === r
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="ادخل السبب..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleGivePoints}
            disabled={selectedTraineeIds.length === 0}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-2xl font-black shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>منح ({pointsToGive > 0 ? `+${pointsToGive}` : pointsToGive}) نقطة لـ ({selectedTraineeIds.length}) طالب محدد الآن ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};

