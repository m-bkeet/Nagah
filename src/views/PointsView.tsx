import React, { useState, useEffect, useMemo } from 'react';
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
  PartyPopper,
  Crown,
  Shield,
  Medal,
  Zap,
  Target,
  RefreshCw,
  Printer,
  ChevronDown
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
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'star' | 'hero' | 'project' | 'speed'>('all');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);
  const [activeTrainee, setActiveTrainee] = useState<Trainee | null>(null);

  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState('مشاركة متميزة وتفاعل إيجابي في المحاضرة');

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
      setTransactions(txRes || []);
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
    setAdjustReason('مشاركة متميزة وتسليم المشروع العملي');
    setIsAdjustModalOpen(true);
  };

  const handleAddPoints = async (traineeId: string, points: number, reason: string) => {
    try {
      const res = await api.addPoints({
        traineeId,
        points,
        reason
      });
      if (res.success) {
        showToast(`تم تحديث النقاط بنجاح (${points > 0 ? '+' : ''}${points} نقطة)`, 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة النقاط', 'error');
    }
  };

  const handleQuickAdd = async (t: Trainee, pts: number, reasonText: string) => {
    await handleAddPoints(t.id, pts, reasonText);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee || adjustAmount <= 0) return;

    const points = adjustType === 'add' ? adjustAmount : -adjustAmount;
    await handleAddPoints(activeTrainee.id, points, adjustReason);
    setIsAdjustModalOpen(false);
  };

  // Preset Reasons for Quick Awards
  const presetReasons = [
    { label: '🌟 مشاركة متميزة بالجلسة', points: 10, type: 'add' },
    { label: '🚀 تسليم المشروع البرمجي', points: 25, type: 'add' },
    { label: '⚡ الالتزام والانضباط المبكر', points: 15, type: 'add' },
    { label: '🤝 مساعدة زملائه بالمعمل', points: 15, type: 'add' },
    { label: '🏆 الحصول على العلامة الكاملة', points: 50, type: 'add' },
    { label: '⚠️ عدم الالتزام بقواعد المعمل', points: -10, type: 'deduct' },
  ];

  // Filter trainees by group, search, and badge category
  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroupFilter === 'all' || t.groupId === selectedGroupFilter;
      
      const pts = t.points || 0;
      let matchesBadge = true;
      if (badgeCategoryFilter === 'star') matchesBadge = pts >= 10 && pts < 50;
      else if (badgeCategoryFilter === 'hero') matchesBadge = pts >= 150;
      else if (badgeCategoryFilter === 'project') matchesBadge = pts >= 80;
      else if (badgeCategoryFilter === 'speed') matchesBadge = pts >= 50 && pts < 80;

      return matchesSearch && matchesGroup && matchesBadge;
    });
  }, [trainees, searchQuery, selectedGroupFilter, badgeCategoryFilter]);

  // Overall statistics
  const totalPointsAwarded = useMemo(() => {
    return trainees.reduce((sum, t) => sum + (t.points || 0), 0);
  }, [trainees]);

  const topScorer = filteredTrainees[0];

  return (
    <div className="space-y-6 select-none font-sans pb-10">
      {/* Dynamic Glass Top Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 dark:bg-slate-900/90 border border-slate-700/70 p-5 md:p-6 backdrop-blur-xl shadow-2xl transition-all">
        {/* Ambient background glow accents */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/30 transform hover:rotate-6 transition-all">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-100 dark:text-slate-50 tracking-tight flex items-center gap-2">
                  <span>لوحة المتصدرين ونظام الشارات والمكافآت الرقمية</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    Gamification 🏆
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 dark:text-slate-300 mt-1">
                  ترتيب أبطال المجموعات والجلسات اليومية والأسبوعية مع المؤثرات الصوتية وأوسمة التفوق
                </p>
              </div>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي النقاط الممنوحة</span>
                <span className="text-sm font-black text-amber-300 font-mono">{totalPointsAwarded.toLocaleString()} نقطة</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">المتدربون المسجلون</span>
                <span className="text-sm font-black text-cyan-200 font-mono">{trainees.length} متدرب</span>
              </div>
            </div>

            <button
              onClick={() => loadData()}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Controls Bar: Group Filter, Timeframe & Search */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Group Selector */}
            <div className="relative">
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="appearance-none bg-slate-950/80 dark:bg-slate-950 border border-slate-700 hover:border-amber-500/60 rounded-2xl pr-4 pl-9 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all cursor-pointer shadow-inner"
              >
                <option value="all">🌐 جميع المجموعات والجلسات</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    👥 {g.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Timeframe Tabs */}
            <div className="flex items-center bg-slate-950/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs shadow-inner">
              <button
                onClick={() => setTimeframeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  timeframeFilter === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الترتيب العام 👑
              </button>
              <button
                onClick={() => setTimeframeFilter('today')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  timeframeFilter === 'today'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                اليومي ⚡
              </button>
              <button
                onClick={() => setTimeframeFilter('weekly')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  timeframeFilter === 'weekly'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الأسبوعي 🏆
              </button>
              <button
                onClick={() => setTimeframeFilter('monthly')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  timeframeFilter === 'monthly'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الشهري 🌟
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم الطالب أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 dark:bg-slate-950 border border-slate-700 hover:border-amber-500/50 rounded-2xl pr-10 pl-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Glowing Champion Ceremony Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-indigo-950/90 border-2 border-amber-400/80 p-5 md:p-6 shadow-[0_15px_40px_rgba(245,158,11,0.25)] backdrop-blur-xl group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-right">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-2 border-white/80 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/40 shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-all">
              <PartyPopper className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 mb-1 shadow font-mono">
                <span>🌟 حفل التتويج التفاعلي المباشر</span>
              </div>
              <h3 className="font-black text-lg text-amber-200 dark:text-amber-100 leading-tight">
                منصة تكريم الأبطال وحفل نجوم الجلسة الحماسي 🏆
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                اضغط لبدء شاشة التتويج التفاعلية مع تصفيق الأبطال، إعلان المراتب من الثالث للأول مع المؤثرات الصوتية والمنصة الذهبية الثلاثية الأبعاد!
              </p>
            </div>
          </div>

          {/* 3D Radiant Tactile Button */}
          <button
            onClick={() => setIsCeremonyOpen(true)}
            className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_6px_0_#92400e] hover:shadow-[0_4px_0_#92400e] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2.5 shrink-0 border border-yellow-200/60"
          >
            <Crown className="w-5 h-5 text-slate-950 animate-bounce" />
            <span className="text-sm">🏆 بدء حفل إظهار نجوم الجلسة الان</span>
          </button>
        </div>
      </div>

      {/* 3D Interactive Badge Categories Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Badge 1: Daily Star */}
        <div
          onClick={() => setBadgeCategoryFilter(badgeCategoryFilter === 'star' ? 'all' : 'star')}
          className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border backdrop-blur-md flex items-center gap-3.5 transform hover:-translate-y-1 hover:shadow-2xl ${
            badgeCategoryFilter === 'star'
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_10px_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/80 scale-[1.02]'
              : 'bg-slate-900/70 hover:bg-slate-800/80 border-amber-500/30 text-slate-200 shadow-lg'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center text-2xl shadow-md font-bold shrink-0">
            🌟
          </div>
          <div>
            <h4 className="font-black text-xs text-amber-300 flex items-center gap-1">
              <span>نجم الحصة اليومي</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">يُمنح للمتفاعل الأبرز في المعمل</p>
          </div>
        </div>

        {/* Badge 2: Weekly Hero */}
        <div
          onClick={() => setBadgeCategoryFilter(badgeCategoryFilter === 'hero' ? 'all' : 'hero')}
          className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border backdrop-blur-md flex items-center gap-3.5 transform hover:-translate-y-1 hover:shadow-2xl ${
            badgeCategoryFilter === 'hero'
              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-[0_10px_25px_rgba(99,102,241,0.3)] ring-2 ring-indigo-400/80 scale-[1.02]'
              : 'bg-slate-900/70 hover:bg-slate-800/80 border-indigo-500/30 text-slate-200 shadow-lg'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white flex items-center justify-center text-2xl shadow-md font-bold shrink-0">
            🏆
          </div>
          <div>
            <h4 className="font-black text-xs text-indigo-300 flex items-center gap-1">
              <span>بطل الأسبوع الأسطوري</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">أعلى نقاط تراكمية تخصصية</p>
          </div>
        </div>

        {/* Badge 3: Practical Projects */}
        <div
          onClick={() => setBadgeCategoryFilter(badgeCategoryFilter === 'project' ? 'all' : 'project')}
          className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border backdrop-blur-md flex items-center gap-3.5 transform hover:-translate-y-1 hover:shadow-2xl ${
            badgeCategoryFilter === 'project'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_10px_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/80 scale-[1.02]'
              : 'bg-slate-900/70 hover:bg-slate-800/80 border-emerald-500/30 text-slate-200 shadow-lg'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center text-2xl shadow-md font-bold shrink-0">
            🎯
          </div>
          <div>
            <h4 className="font-black text-xs text-emerald-300 flex items-center gap-1">
              <span>إنجاز المشاريع البرمجية</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">تسليم التطبيقات في الموعد</p>
          </div>
        </div>

        {/* Badge 4: Speed & Discipline */}
        <div
          onClick={() => setBadgeCategoryFilter(badgeCategoryFilter === 'speed' ? 'all' : 'speed')}
          className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border backdrop-blur-md flex items-center gap-3.5 transform hover:-translate-y-1 hover:shadow-2xl ${
            badgeCategoryFilter === 'speed'
              ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_10px_25px_rgba(168,85,247,0.3)] ring-2 ring-purple-400/80 scale-[1.02]'
              : 'bg-slate-900/70 hover:bg-slate-800/80 border-purple-500/30 text-slate-200 shadow-lg'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white flex items-center justify-center text-2xl shadow-md font-bold shrink-0">
            ⚡
          </div>
          <div>
            <h4 className="font-black text-xs text-purple-300 flex items-center gap-1">
              <span>سرعة الإنجاز والانضباط</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">مواعيد الدخول والأخلاق</p>
          </div>
        </div>
      </div>

      {/* 3D Vibrant Podium Cards for Top 3 Champions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>منصة المراكز الثلاثة الأولى (Top 3 Podium Champions)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            المحتل للقمة: {topScorer ? topScorer.fullName : 'جاري الفرز...'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredTrainees.slice(0, 3).map((t, index) => {
            // Rank 0 = 1st Place (Gold), Rank 1 = 2nd Place (Silver), Rank 2 = 3rd Place (Bronze)
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={t.id}
                className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 backdrop-blur-xl border-2 shadow-2xl flex flex-col justify-between group transform hover:-translate-y-2.5 hover:scale-[1.02] ${
                  isFirst
                    ? 'bg-gradient-to-b from-amber-500/30 via-amber-600/20 to-slate-900/95 border-amber-300 shadow-[0_20px_50px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] ring-2 ring-amber-400/80'
                    : isSecond
                    ? 'bg-gradient-to-b from-cyan-400/25 via-slate-700/30 to-slate-900/95 border-cyan-300 shadow-[0_15px_40px_rgba(6,182,212,0.35),inset_0_2px_4px_rgba(255,255,255,0.8)]'
                    : 'bg-gradient-to-b from-orange-500/25 via-amber-900/20 to-slate-900/95 border-orange-400 shadow-[0_15px_40px_rgba(249,115,22,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)]'
                }`}
              >
                {/* Background Ambient Glow */}
                <div
                  className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-60 ${
                    isFirst ? 'bg-amber-400' : isSecond ? 'bg-cyan-400' : 'bg-orange-500'
                  }`}
                />

                {/* Header Rank Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-white/80 shadow-amber-500/40'
                        : isSecond
                        ? 'bg-gradient-to-r from-cyan-300 to-slate-200 text-slate-950 border-white/80 shadow-cyan-500/40'
                        : 'bg-gradient-to-r from-orange-400 to-amber-600 text-white border-white/60 shadow-orange-500/40'
                    }`}
                  >
                    {isFirst ? (
                      <>
                        <Crown className="w-4 h-4 text-slate-950 animate-bounce" />
                        المركز الأول 🥇
                      </>
                    ) : isSecond ? (
                      <>
                        <Shield className="w-4 h-4 text-slate-950" />
                        المركز الثاني 🥈
                      </>
                    ) : (
                      <>
                        <Medal className="w-4 h-4 text-white" />
                        المركز الثالث 🥉
                      </>
                    )}
                  </span>

                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-950/70 text-slate-300 border border-slate-700">
                    كود: {t.code}
                  </span>
                </div>

                {/* Trainee Details */}
                <div className="flex items-center gap-4 my-2 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 shadow-xl flex items-center justify-center ${
                      isFirst
                        ? 'border-amber-300 shadow-amber-500/40 bg-amber-950'
                        : isSecond
                        ? 'border-cyan-300 shadow-cyan-500/40 bg-slate-900'
                        : 'border-orange-400 shadow-orange-500/40 bg-amber-950'
                    }`}
                  >
                    {t.photoUrl || (t as any).photo ? (
                      <img
                        src={t.photoUrl || (t as any).photo}
                        alt={t.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-black text-amber-300">{t.fullName.slice(0, 1)}</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-black text-base md:text-lg text-slate-100 dark:text-slate-50 leading-tight">
                      {t.fullName}
                    </h3>
                    <p className="text-xs text-slate-300/80 font-medium">
                      {t.groupName || 'المجموعة التدريبية'}
                    </p>
                  </div>
                </div>

                {/* 3D Point Counter Box & Quick Actions */}
                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3 relative z-10">
                  <div
                    className={`px-4 py-2.5 rounded-2xl border text-center shadow-inner ${
                      isFirst
                        ? 'bg-amber-950/90 border-amber-400/80 text-amber-300'
                        : isSecond
                        ? 'bg-cyan-950/90 border-cyan-400/80 text-cyan-200'
                        : 'bg-orange-950/90 border-orange-400/80 text-orange-200'
                    }`}
                  >
                    <span className="text-2xl font-black font-mono block leading-none">
                      {t.points || 0}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 mt-0.5 block">نقطة تميز</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickAdd(t, 10, 'مشاركة ممتازة في المعمل')}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 shadow"
                      title="إضافة 10 نقاط سريعة"
                    >
                      +10 🌟
                    </button>
                    <button
                      onClick={() => handleOpenAdjust(t)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 shadow"
                    >
                      منح / تعديل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="bg-slate-900/80 dark:bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 md:p-5 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
            <h3 className="font-black text-sm md:text-base text-slate-100">
              جدول الترتيب الكامل والمتصدرين (حسب الفرز المحدد)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            إجمالي المعروض: {filteredTrainees.length} متدرب
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/90 text-slate-300 font-bold border-b border-slate-700/80 select-none">
              <tr>
                <th className="p-4 text-center">الترتيب</th>
                <th className="p-4">الكود</th>
                <th className="p-4">اسم المتدرب</th>
                <th className="p-4">المجموعة والفرع</th>
                <th className="p-4 text-center">الرصيد الكلي للنقاط</th>
                <th className="p-4 text-center">المستوى والشارة المستحقة</th>
                <th className="p-4 text-center">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    جاري تحميل ترتيب النقاط ومتصدرين المجموعات...
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
                  const rank = idx + 1;

                  let badge = 'مبتدئ 🐣';
                  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

                  if (points >= 150) {
                    badge = 'متألق أسطوري 🌟';
                    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm';
                  } else if (points >= 80) {
                    badge = 'متقدم ذهبي 🏆';
                    badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm';
                  } else if (points >= 30) {
                    badge = 'نشط فضي 🥈';
                    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm';
                  }

                  const isTop3 = rank <= 3;

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors hover:bg-slate-800/60 ${
                        isTop3 ? 'bg-amber-500/5 font-semibold' : ''
                      }`}
                    >
                      <td className="p-4 text-center font-mono font-bold text-sm">
                        {rank === 1 ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black shadow">
                            🥇 #1
                          </span>
                        ) : rank === 2 ? (
                          <span className="px-2.5 py-1 rounded-full bg-slate-300 text-slate-950 font-black shadow">
                            🥈 #2
                          </span>
                        ) : rank === 3 ? (
                          <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white font-black shadow">
                            🥉 #3
                          </span>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-400">{t.code}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-amber-300 text-xs shadow">
                            {t.photoUrl || (t as any).photo ? (
                              <img
                                src={t.photoUrl || (t as any).photo}
                                alt={t.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              t.fullName.slice(0, 1)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block text-sm">
                              {t.fullName}
                            </span>
                            {t.parentPhone && (
                              <span className="text-[10px] text-slate-400 font-mono dir-ltr">
                                📞 {t.parentPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-medium">
                          {t.groupName || 'المجموعة الأساسية'}
                        </span>
                      </td>

                      <td className="p-4 text-center font-mono font-black text-amber-300 text-base">
                        {points}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badgeColor}`}>
                          {badge}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuickAdd(t, 10, 'مشاركة ممتازة بالجلسة')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all active:scale-95"
                            title="+10 نقاط"
                          >
                            +10 🌟
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(t)}
                            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all active:scale-95"
                          >
                            تعديل النقاط
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

      {/* Adjust Points Modal */}
      {isAdjustModalOpen && activeTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">تعديل نقاط المتدرب: {activeTrainee.fullName}</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
              {/* Add vs Deduct Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  منح نقاط إضافية (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'deduct'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  خصم نقاط (-)
                </button>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">نماذج أسباب جاهزة للسرعة:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {presetReasons.map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAdjustReason(pr.label);
                        setAdjustAmount(Math.abs(pr.points));
                        setAdjustType(pr.type as 'add' | 'deduct');
                      }}
                      className="text-right p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] text-slate-200 truncate transition-all active:scale-95"
                    >
                      {pr.label} ({pr.points > 0 ? `+${pr.points}` : pr.points})
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">عدد النقاط *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-amber-500/80 rounded-2xl px-4 py-2.5 text-amber-300 font-mono font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">سبب التعديل بالتفصيل *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30"
                >
                  تأكيد وحفظ النقاط
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
          initialGroupId={selectedGroupFilter !== 'all' ? selectedGroupFilter : undefined}
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
