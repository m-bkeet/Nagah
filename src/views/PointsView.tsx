import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { SessionCeremonyModal } from '../components/SessionCeremonyModal';
import {
  Trophy,
  Award,
  Star,
  Plus,
  Minus,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Flame,
  CheckCircle2,
  Calendar,
  Filter,
  Users2,
  PartyPopper
} from 'lucide-react';
import { Trainee, PointTransaction, Group } from '../types';

export const PointsView: React.FC = () => {
  const { activeBranchId, showToast, refreshKey } = useCenter();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters for leaderboard per group, timeframe (daily, weekly, monthly, all)
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | 'weekly' | 'monthly'>('all');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);
  const [activeTrainee, setActiveTrainee] = useState<Trainee | null>(null);

  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState('مشاركة متميزة في المحاضرة');

  useEffect(() => {
    loadData();
  }, [activeBranchId, refreshKey]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tRes, gRes, txRes] = await Promise.all([
        api.getTrainees(),
        api.getGroups(),
        api.getPointTransactions()
      ]);
      const filteredBranches = activeBranchId !== 'all' ? tRes.filter(t => t.branchId === activeBranchId) : tRes;
      setTrainees(filteredBranches.sort((a, b) => (b.points || 0) - (a.points || 0)));
      setGroups(activeBranchId !== 'all' ? gRes.filter(g => g.branchId === activeBranchId) : gRes);
      setTransactions(txRes);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات النقاط', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdjust = (t: Trainee) => {
    setActiveTrainee(t);
    setAdjustAmount(10);
    setAdjustType('add');
    setAdjustReason('مشاركة ممتازة وتسليم المشروع العملي');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee || adjustAmount <= 0) return;

    try {
      const points = adjustType === 'add' ? adjustAmount : -adjustAmount;
      const res = await api.addPoints({
        traineeId: activeTrainee.id,
        points,
        reason: adjustReason
      });

      if (res.success) {
        showToast(
          `تم ${adjustType === 'add' ? 'إضافة' : 'خصم'} ${adjustAmount} نقطة للمتدرب (${activeTrainee.fullName})`,
          'success'
        );
        setIsAdjustModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل النقاط', 'error');
    }
  };

  // Filter trainees by group and search query
  const filteredTrainees = trainees.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || t.groupId === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            لوحات المتصدرين ونظام الشارات والمكافآت (Gamification)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ترتيب المتصدرين لكل مجموعة وجلسة ويومي وأسبوعي وشهري مع نظام الأوسمة والشارات التربوية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group Filter */}
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">جميع المجموعات والجلسات</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Timeframe Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeframeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${timeframeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الترتيب العام
            </button>
            <button
              onClick={() => setTimeframeFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${timeframeFilter === 'today' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              اليومي ⚡
            </button>
            <button
              onClick={() => setTimeframeFilter('weekly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${timeframeFilter === 'weekly' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الأسبوعي 🏆
            </button>
            <button
              onClick={() => setTimeframeFilter('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${timeframeFilter === 'monthly' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الشهري 🌟
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Badges & Trophies Showcase Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/20 via-indigo-500/15 to-purple-500/20 border border-amber-500/40 p-5 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="font-black text-base text-amber-300">منصة تكريم الأبطال وحفل نجوم الجلسة الحماسي 🏆</h3>
            <p className="text-xs text-slate-300 mt-0.5">اضغط لبدء حفل التتويج التفاعلي، إعلان الأبطال من الثالث للأول مع مؤثرات صوتية وتصفيق ونطق الأسماء!</p>
          </div>
        </div>

        <button
          onClick={() => setIsCeremonyOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 flex items-center gap-2 transform hover:scale-105 transition-all shrink-0"
        >
          <PartyPopper className="w-4 h-4" />
          <span>🏆 بدء حفل إظهار نجوم الجلسة</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <span className="text-3xl">🌟</span>
          <div>
            <h4 className="font-bold text-xs text-amber-300">نجم الحصة اليومي</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">يُمنح للمتفاعل الأبرز في جلسة المعمل</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <h4 className="font-bold text-xs text-indigo-300">بطل المجموعة الأسبوعي</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">أعلى نقاط تراكمية خلال الأسبوع</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h4 className="font-bold text-xs text-emerald-300">إنجاز المشاريع العملية</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">تسليم التمارين البرمجية في موعدها</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <div>
            <h4 className="font-bold text-xs text-purple-300">سرعة الانجاز والانضباط</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">الالتزام بمواعيد الحضور وساعة الدخول</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTrainees.slice(0, 3).map((t, index) => {
          const colors = [
            'from-amber-500/20 border-amber-500/60 text-amber-300',
            'from-slate-400/20 border-slate-400/60 text-slate-200',
            'from-amber-700/20 border-amber-700/60 text-amber-600'
          ];
          const rankNames = ['المركز الأول 🥇', 'المركز الثاني 🥈', 'المركز الثالث 🥉'];

          return (
            <div
              key={t.id}
              className={`p-5 rounded-2xl bg-gradient-to-b ${colors[index]} to-slate-900/80 border backdrop-blur-md shadow-xl flex items-center justify-between`}
            >
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider block">
                  {rankNames[index]}
                </span>
                <h3 className="font-bold text-base text-slate-100">{t.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">كود: {t.code} • {t.groupName || 'المجموعة'}</p>
              </div>

              <div className="text-center bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-2xl font-black font-mono block text-amber-400">
                  {t.points || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">نقطة</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>لوحة الترتيب والمتصدرين (حسب المجموعة والفترة: {timeframeFilter === 'today' ? 'اليومي' : timeframeFilter === 'weekly' ? 'الأسبوعي' : timeframeFilter === 'monthly' ? 'الشهري' : 'العام'})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{filteredTrainees.length} متدرب</span>
        </div>

        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
            <tr>
              <th className="p-3.5 text-center">الترتيب</th>
              <th className="p-3.5">الكود</th>
              <th className="p-3.5">اسم المتدرب</th>
              <th className="p-3.5">المجموعة والجلسة</th>
              <th className="p-3.5 text-center">الرصيد الكلي للنقاط</th>
              <th className="p-3.5 text-center">المستوى والشارة</th>
              <th className="p-3.5 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredTrainees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  لا يوجد متدربون مطابقون للبحث أو الفلتر المحدد.
                </td>
              </tr>
            ) : (
              filteredTrainees.map((t, idx) => {
                const points = t.points || 0;
                let badge = 'مبتدئ';
                let badgeColor = 'bg-slate-700 text-slate-300 border-slate-600';
                if (points >= 150) {
                  badge = 'متألق أسطوري 🌟';
                  badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
                } else if (points >= 80) {
                  badge = 'متقدم ذهبي 🏆';
                  badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
                } else if (points >= 30) {
                  badge = 'نشط فضي 🥈';
                  badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
                }

                return (
                  <tr key={t.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">{t.code}</td>
                    <td className="p-3.5 font-bold text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-800 flex items-center justify-center">
                          {t.photoUrl || (t as any).photo ? (
                            <img src={t.photoUrl || (t as any).photo} alt={t.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-amber-400">{t.fullName.slice(0, 1)}</span>
                          )}
                        </div>
                        <span className="truncate">{t.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{t.groupName || 'المجموعة الأساسية'}</td>
                    <td className="p-3.5 text-center font-mono font-black text-amber-300 text-sm">
                      {points}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {badge}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenAdjust(t)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold"
                      >
                        منح / خصم نقاط
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Points Modal */}
      {isAdjustModalOpen && activeTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">تعديل نقاط: {activeTrainee.fullName}</h3>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  منح نقاط إضافية
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    adjustType === 'deduct'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  خصم نقاط
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عدد النقاط *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-amber-500 rounded-xl px-3 py-2 text-amber-300 font-mono font-black text-base"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">سبب المنح أو الخصم *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  تأكيد العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Ceremony Modal */}
      {isCeremonyOpen && (
        <SessionCeremonyModal
          trainees={trainees}
          groups={groups}
          initialGroupId={selectedGroupId !== 'all' ? selectedGroupId : undefined}
          initialAttendeesOnly={true}
          onClose={() => setIsCeremonyOpen(false)}
          onAwardBonus={(traineeId, points, reason) => {
            handleAddPoints(traineeId, points, reason);
          }}
        />
      )}
    </div>
  );
};
