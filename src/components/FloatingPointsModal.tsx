import React, { useState, useEffect } from 'react';
import { X, Star, Users, Search, Target, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Trainee } from '../types';

interface FloatingPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingPointsModal: React.FC<FloatingPointsModalProps> = ({ isOpen, onClose }) => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [pointsToGive, setPointsToGive] = useState(10);
  const [reason, setReason] = useState('مشاركة متميزة وإجابة صحيحة في الحصة');

  useEffect(() => {
    if (isOpen) {
      loadTrainees();
    }
  }, [isOpen]);

  const loadTrainees = async () => {
    setLoading(true);
    try {
      const data = await api.getTrainees();
      setTrainees(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGivePoints = async () => {
    if (!selectedTraineeId) return;
    try {
      // Find the trainee to get current points
      const t = trainees.find(tr => tr.id === selectedTraineeId);
      if (!t) return;
      
      const newPoints = (t.totalPoints || t.points || 0) + pointsToGive;
      await api.updateTraineePoints(t.id, newPoints);
      
      // We can use a custom toast if available, or just a simple alert for now
      // Usually showToast is imported or passed, but let's use standard alert if toast is not defined here
      const msg = `🎉 تم منح ${pointsToGive} نقطة للطالب ${t.fullName} بنجاح!`;
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(msg, 'success');
      } else {
        alert(msg);
      }
      
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filtered = trainees.filter(t => 
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={onClose} dir="rtl">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-100">نظام المكافآت السريع</h3>
              <p className="text-[10px] text-slate-400">امنح النقاط لطلابك بضغطة واحدة من أي شاشة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن اسم الطالب أو الكود السري..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          {/* Student List */}
          <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800 overflow-y-auto max-h-[30vh] p-2 space-y-1">
            {loading ? (
              <p className="text-center py-4 text-slate-500 text-xs">جاري جلب قائمة الطلاب...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs">لا يوجد طلاب مطابقون للبحث</p>
            ) : (
              filtered.slice(0, 15).map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTraineeId(t.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedTraineeId === t.id 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' 
                    : 'bg-slate-900 border-transparent hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                  } border`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                      {t.code || '؟'}
                    </div>
                    <span className="font-bold text-xs">{t.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black">{t.totalPoints || t.points || 0}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Points config */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">كم نقطة تريد منحها؟</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map(pt => (
                  <button
                    key={pt}
                    onClick={() => setPointsToGive(pt)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                      pointsToGive === pt 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                      : 'bg-slate-950 text-amber-400 hover:bg-slate-800 border-amber-500/30'
                    }`}
                  >
                    +{pt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">سبب التميز (رسالة ولي الأمر)</label>
              <input 
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleGivePoints}
            disabled={!selectedTraineeId}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-2xl font-black shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>منح النقاط للطالب المحدد الآن ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
