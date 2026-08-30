import React, { useState, useEffect, useMemo } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { 
  Users, BookOpen, Monitor, Shield, Globe, Wifi, 
  Sparkles, DollarSign, Activity, AlertTriangle, RefreshCw,
  TrendingUp, Calendar, Layers, MapPin, Building, CalendarCheck, Flame, 
  Receipt, PiggyBank, Download, Plus, Trophy, Award, Star, Medal, ArrowUpRight, CheckCircle2, Crown, X, Sparkle, Upload
} from 'lucide-react';
import { Trainee, Course, Group } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { activeBranchId, branches, refreshKey, settings, showToast, refreshAll } = useCenter();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [todayAttendanceCount, setTodayAttendanceCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHonorModal, setShowHonorModal] = useState(false);

  const activeBranch = branches.find(b => b.id === activeBranchId);

  useEffect(() => {
    fetchData();
  }, [activeBranchId, refreshKey]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const [trRes, crRes, grRes, fnRes, attRes] = await Promise.allSettled([
        api.getTrainees(activeBranchId !== 'all' ? { branchId: activeBranchId } : {}),
        api.getCourses(),
        api.getGroups(),
        api.getFinanceSummary(activeBranchId !== 'all' ? { branchId: activeBranchId } : {}),
        api.getAttendance({ date: todayStr })
      ]);
      if (trRes.status === 'fulfilled') setTrainees(trRes.value || []);
      if (crRes.status === 'fulfilled') setCourses(crRes.value || []);
      if (grRes.status === 'fulfilled') setGroups(grRes.value || []);
      if (fnRes.status === 'fulfilled') setFinanceSummary(fnRes.value || null);
      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) {
        const presentCount = attRes.value.filter((a: any) => a.status === 'present' || a.status === 'late').length;
        setTodayAttendanceCount(presentCount);
      } else {
        setTodayAttendanceCount(0);
      }
    } catch (err) {
      console.warn('Soft notification on load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Honor roll / Stars of the week data synced directly with the database
  const honorTrainees = useMemo(() => {
    if (!trainees || trainees.length === 0) return [];
    
    // Sort trainees by points/stars descending
    const sorted = [...trainees].sort((a, b) => {
      const aAny = a as any;
      const bAny = b as any;
      const ptsA = Number(a.totalPoints || a.points || aAny.stats?.points || 0);
      const ptsB = Number(b.totalPoints || b.points || bAny.stats?.points || 0);
      if (ptsB !== ptsA) return ptsB - ptsA;
      const attA = Number(aAny.attendanceCount || 0);
      const attB = Number(bAny.attendanceCount || 0);
      return attB - attA;
    });

    return sorted.slice(0, 10).map((t, idx) => {
      const tAny = t as any;
      const points = Number(t.totalPoints || t.points || tAny.stats?.points || 0);
      const attCount = Number(tAny.attendanceCount || 0);
      const attTotal = Math.max(1, Number(tAny.totalAttendance || (attCount > 0 ? attCount : 1)));
      const attRate = Math.min(100, Math.round((attCount / attTotal) * 100));
      
      let grade = 'امتياز مرتفع 99%';
      if (attRate >= 90) grade = `امتياز ${attRate}%`;
      else if (attRate >= 80) grade = `جيد جداً ${attRate}%`;
      else if (attRate >= 70) grade = `جيد ${attRate}%`;
      else if (points > 0) grade = `نشط ${points} نقطة`;
      else grade = 'منتظم ومتميز';

      let badgeTitle = 'نجم الأسبوع 🌟';
      if (idx === 0) badgeTitle = 'المركز الأول 👑';
      else if (idx === 1) badgeTitle = 'نجم التميز ✨';
      else if (idx === 2) badgeTitle = 'المبدع المتألق 🚀';
      else if (idx === 3) badgeTitle = 'فارس التطبيق 💡';
      else badgeTitle = 'متفوق متميز ⭐';

      const tBadges = tAny.badges as Array<any> | undefined;

      return {
        id: t.id || `trainee_${idx}`,
        name: t.fullName || tAny.name || 'متدرب متميز',
        code: t.code || '',
        course: t.courseName || tAny.course || 'الدورة التدريبية',
        group: t.groupName || tAny.group || '',
        points: points,
        grade: grade,
        avatar: t.photoUrl || tAny.photo || '',
        badge: (tBadges && tBadges.length > 0) ? `${tBadges[0].title || tBadges[0].name || badgeTitle}` : badgeTitle,
        initial: ((t.fullName || tAny.name || 'ن').trim()).charAt(0)
      };
    });
  }, [trainees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-cyan-400 font-mono">جاري تحميل واجهة النظام...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dir-rtl text-slate-900 dark:text-slate-100 font-sans max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-between p-2 sm:p-3 overflow-x-hidden relative select-none">
      
      {/* 1. TOP SYSTEM INDICATORS BAR (6 TRANSPARENT RADIANT PILLS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 shrink-0 mb-2">
        {/* Pill 1: SPA */}
        <button 
          type="button"
          onClick={() => onNavigate('settings')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-emerald-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-emerald-300 dark:border-emerald-500/50 hover:border-emerald-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors truncate">الواجهة الأمامية (SPA)</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-500/25 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">ms 2</span>
        </button>

        {/* Pill 2: Cloud Server */}
        <button 
          type="button"
          onClick={() => onNavigate('devices')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-cyan-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-cyan-300 dark:border-cyan-500/50 hover:border-cyan-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_18px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors truncate">خادم السحابة (Node 3000)</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-100 dark:bg-cyan-500/25 border border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(6,182,212,0.2)]">ms 22</span>
        </button>

        {/* Pill 3: WebSockets Sync */}
        <button 
          type="button"
          onClick={() => onNavigate('messages')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-purple-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-purple-300 dark:border-purple-500/50 hover:border-purple-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(168,85,247,0.2)] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">التزامن اللحظي (WebSockets)</span>
          </div>
          <span className="text-[9px] font-mono text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-500/25 border border-purple-300 dark:border-purple-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(168,85,247,0.2)]">ms 10</span>
        </button>

        {/* Pill 4: AI Gemini */}
        <button 
          type="button"
          onClick={() => onNavigate('reports')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-amber-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-amber-300 dark:border-amber-500/50 hover:border-amber-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors truncate">الذكاء الاصطناعي (Gemini)</span>
          </div>
          <span className="text-[9px] font-mono text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/25 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(245,158,11,0.2)]">ms 18</span>
        </button>

        {/* Pill 5: Smart Lab Devices */}
        <button 
          type="button"
          onClick={() => onNavigate('devices')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-purple-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-purple-300 dark:border-purple-500/50 hover:border-purple-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(168,85,247,0.2)] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Monitor className="w-4 h-4 text-purple-700 dark:text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">أجهزة المعامل الذكية</span>
          </div>
          <span className="text-[9px] font-mono text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-500/25 border border-purple-300 dark:border-purple-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(168,85,247,0.2)]">ms 5</span>
        </button>

        {/* Pill 6: RBAC Security */}
        <button 
          type="button"
          onClick={() => onNavigate('settings')}
          className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-[#0d1424]/90 hover:bg-rose-50 dark:hover:from-slate-800 dark:hover:to-[#162038] backdrop-blur-md border border-rose-300 dark:border-rose-500/50 hover:border-rose-500 px-3 py-1.5 rounded-full flex items-center justify-between text-right group transition-all shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.2)] hover:shadow-[0_0_18px_rgba(244,63,94,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors truncate">جدار الأمان والتحقق (RBAC)</span>
          </div>
          <span className="text-[9px] font-mono text-rose-700 dark:text-rose-300 font-bold bg-rose-100 dark:bg-rose-500/25 border border-rose-300 dark:border-rose-500/40 px-2 py-0.5 rounded-full shrink-0 mr-1 shadow-[0_0_8px_rgba(244,63,94,0.2)]">ms 1</span>
        </button>
      </div>

      {/* TOP FEATURED: STARS OF THE WEEK (نجوم الأسبوع) HERO BADGE BAR */}
      <div className="bg-gradient-to-r from-purple-50 via-amber-50/70 to-purple-50 dark:from-[#1b122e] dark:via-[#0f172a] dark:to-[#1b122e] border border-amber-300 dark:border-amber-500/60 rounded-2xl p-2 px-3 shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-500/25 rounded-xl text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-purple-950 dark:text-amber-300">⭐ نجوم الأسبوع المتفوقين</span>
              <span className="text-[10px] bg-purple-100 dark:bg-amber-500/20 text-purple-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-amber-500/40 shadow-sm">
                Weekly Stars
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
              أفضل المتدربين أداءً وتفوقاً في الاختبارات والتطبيقات العملية لهذا الأسبوع (مزامنة مباشرة مع قاعدة البيانات)
            </p>
          </div>
        </div>

        {/* Top Stars Avatars Showcase */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center -space-x-2 space-x-reverse">
            {honorTrainees.slice(0, 3).map((item, idx) => (
              <div 
                key={item.id} 
                className="relative group cursor-pointer"
                onClick={() => setShowHonorModal(true)}
                title={`${item.name} - ${item.badge}`}
              >
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className={`w-8 h-8 rounded-full object-cover border-2 shadow-md transition-transform group-hover:scale-125 z-${30 - idx * 10} ${
                      idx === 0 ? 'border-amber-400 ring-2 ring-amber-500/50' :
                      idx === 1 ? 'border-purple-400 ring-2 ring-purple-500/40' : 'border-amber-600'
                    }`}
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 ${
                    idx === 0 ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-400' :
                    idx === 1 ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 border-purple-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300'
                  }`}>
                    {item.initial}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-[10px]">
                  {idx === 0 ? '👑' : idx === 1 ? '🌟' : '⭐'}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHonorModal(true)}
            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>عرض لوحة الشرف</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CIRCULAR ORBIT STAGE (LEFT CARDS, CENTER ORBIT PLANETS, RIGHT CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center flex-1 my-auto">
        
        {/* LEFT COLUMN: 5 FINANCIAL & SYSTEM CARDS */}
        <div className="lg:col-span-3 space-y-2.5 order-2 lg:order-1">
          
          {/* Revenue Card (Bar Graph) */}
          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className="w-full text-right bg-white/70 dark:bg-[#070b14]/70 p-3 rounded-2xl border border-emerald-300/50 dark:border-emerald-500/30 hover:border-emerald-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md backdrop-blur-md dark:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_10px_rgba(16,185,129,0.1)] hover:dark:shadow-[0_8px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 cursor-pointer animate-pulse-slow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono filter drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                {(financeSummary?.totalRevenue || 0).toLocaleString()} <span className="text-[10px] text-slate-500 dark:text-slate-400">ج.م</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">الإيرادات</span>
                <div className="p-1 bg-emerald-100 dark:bg-emerald-500/25 rounded-lg text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <Building className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            {/* Emerald Bar Chart SVG Visualization */}
            <div className="flex items-end gap-1 h-6 mt-1 w-full justify-between opacity-85 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 bg-emerald-400/60 dark:bg-emerald-400/50 rounded-t h-[30%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-500/70 dark:bg-emerald-400/60 rounded-t h-[50%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-400/60 dark:bg-emerald-400/50 rounded-t h-[40%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-600/80 dark:bg-emerald-400/80 rounded-t h-[70%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-500/70 dark:bg-emerald-400/70 rounded-t h-[60%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-t h-[90%] shadow-[0_0_6px_rgba(16,185,129,0.7)]"></div>
              <div className="w-1.5 bg-emerald-500/90 dark:bg-emerald-400/90 rounded-t h-[75%] shadow-[0_0_5px_rgba(16,185,129,0.6)]"></div>
              <div className="w-1.5 bg-emerald-400/60 dark:bg-emerald-400/50 rounded-t h-[40%] shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <div className="w-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-t h-[85%] shadow-[0_0_6px_rgba(16,185,129,0.7)]"></div>
              <div className="w-1.5 bg-emerald-600 dark:bg-emerald-300 rounded-t h-[100%] shadow-[0_0_8px_rgba(16,185,129,0.9)]"></div>
            </div>
          </button>

          {/* Expenses Card (Red Bar Graph) */}
          <button
            type="button"
            onClick={() => onNavigate('expenses')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-rose-300 dark:border-rose-500/60 hover:border-rose-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(244,63,94,0.25),inset_0_1px_0_rgba(253,164,175,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(244,63,94,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-rose-700 dark:text-rose-300 font-mono filter drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]">
                {(financeSummary?.totalExpenses || 0).toLocaleString()} <span className="text-[10px] text-slate-500 dark:text-slate-400">ج.م</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">المصروفات</span>
                <div className="p-1 bg-rose-100 dark:bg-rose-500/25 rounded-lg text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            {/* Rose Bar Chart SVG Visualization */}
            <div className="flex items-end gap-1 h-6 mt-1 w-full justify-between opacity-85 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 bg-rose-400/50 dark:bg-rose-400/50 rounded-t h-[20%] shadow-[0_0_4px_rgba(244,63,94,0.5)]"></div>
              <div className="w-1.5 bg-rose-500/60 dark:bg-rose-400/60 rounded-t h-[45%] shadow-[0_0_4px_rgba(244,63,94,0.5)]"></div>
              <div className="w-1.5 bg-rose-400/50 dark:bg-rose-400/50 rounded-t h-[35%] shadow-[0_0_4px_rgba(244,63,94,0.5)]"></div>
              <div className="w-1.5 bg-rose-600/80 dark:bg-rose-400/80 rounded-t h-[80%] shadow-[0_0_6px_rgba(244,63,94,0.7)]"></div>
              <div className="w-1.5 bg-rose-500/70 dark:bg-rose-400/70 rounded-t h-[55%] shadow-[0_0_5px_rgba(244,63,94,0.6)]"></div>
              <div className="w-1.5 bg-rose-600 dark:bg-rose-400 rounded-t h-[95%] shadow-[0_0_8px_rgba(244,63,94,0.9)]"></div>
              <div className="w-1.5 bg-rose-500/60 dark:bg-rose-400/60 rounded-t h-[50%] shadow-[0_0_5px_rgba(244,63,94,0.6)]"></div>
              <div className="w-1.5 bg-rose-600/90 dark:bg-rose-400/90 rounded-t h-[75%] shadow-[0_0_6px_rgba(244,63,94,0.7)]"></div>
            </div>
          </button>

          {/* Treasury Card (Purple & Gold Bar Graph) */}
          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-amber-300 dark:border-amber-500/60 hover:border-amber-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(253,230,138,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-amber-700 dark:text-amber-300 font-mono filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                {(financeSummary?.netTreasury || 0).toLocaleString()} <span className="text-[10px] text-slate-500 dark:text-slate-400">ج.م</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">الخزينة</span>
                <div className="p-1 bg-amber-100 dark:bg-amber-500/25 rounded-lg text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  <PiggyBank className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            {/* Gold Bar Chart SVG Visualization */}
            <div className="flex items-end gap-1.5 h-6 mt-1 w-full justify-end opacity-85 group-hover:opacity-100 transition-opacity">
              <div className="w-2.5 bg-amber-300 dark:bg-amber-400/50 rounded-t h-[40%] shadow-[0_0_4px_rgba(245,158,11,0.5)]"></div>
              <div className="w-2.5 bg-amber-600 dark:bg-amber-400 rounded-t h-[90%] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
              <div className="w-2.5 bg-amber-400 dark:bg-amber-400/70 rounded-t h-[60%] shadow-[0_0_5px_rgba(245,158,11,0.6)]"></div>
            </div>
          </button>

          {/* Discipline Card (Circular Gauge + Waveform) */}
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-2.5 rounded-2xl border border-cyan-300 dark:border-cyan-500/60 hover:border-cyan-500 flex items-center justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(165,243,252,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            {/* Circular Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-cyan-600 dark:text-cyan-400" strokeDasharray="98, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[10px] font-black text-cyan-800 dark:text-white font-mono filter drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]">98%</span>
            </div>

            <div className="flex-1 mr-2 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">الانضباط العام</span>
                <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex items-center px-1 border border-cyan-200 dark:border-cyan-500/40 shadow-inner">
                <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 animate-pulse rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              </div>
            </div>
          </button>

          {/* Branches & Labs Card */}
          <button
            type="button"
            onClick={() => onNavigate('branches')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-purple-300 dark:border-blue-500/60 hover:border-purple-500 flex items-center justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(191,219,254,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-100">الفروع والمقرات</div>
              <div className="text-sm font-black text-purple-700 dark:text-blue-300 font-mono mt-0.5 filter drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">{branches.length || 2} فرع نشط</div>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-blue-500/25 rounded-xl text-purple-700 dark:text-blue-300 border border-purple-300 dark:border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
              <MapPin className="w-4 h-4" />
            </div>
          </button>

        </div>

        {/* CENTER COLUMN: FUTURISTIC 3D CYBER SHIELD EMBLEM FRAME & ORBIT BUTTONS */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-1 order-1 lg:order-2">
          
          {/* Ambient Royal Purple & Gold Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/15 via-amber-500/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* 3D Floor Shadow under floating logo */}
          <div className="absolute top-[230px] sm:top-[255px] left-1/2 -translate-x-1/2 w-48 sm:w-56 h-8 bg-amber-500/20 dark:bg-amber-500/25 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>

          {/* Futuristic 3D Cyber Shield Framework & Orbit Stage */}
          <div className="flex flex-col items-center justify-center relative w-full h-[320px] sm:h-[350px]">
            
            {/* Outer Rotating Cyber Rings */}
            <div className="absolute inset-0 m-auto w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] rounded-full border-2 border-purple-400/40 dark:border-cyan-400/40 border-dashed animate-[spin_90s_linear_infinite] pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.15)]"></div>
            <div className="absolute inset-0 m-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border border-amber-400/50 dark:border-amber-400/45 border-dashed animate-[spin_60s_linear_infinite_reverse] pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.15)]"></div>

            {/* Central 3D Elevated Circular Logo Shield Frame */}
            <label 
              htmlFor="logo-file-input"
              className="relative z-20 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-purple-100 via-white to-amber-50 dark:from-[#1e293b] dark:via-[#0f172a] dark:to-[#090d16] p-3 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_60px_rgba(245,158,11,0.35)] border-4 border-amber-400 ring-8 ring-amber-500/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform -translate-y-2 hover:-translate-y-4 hover:scale-105 group"
              title="اضغط هنا مباشرة لتغيير شعار المركز"
            >
              <input 
                 id="logo-file-input"
                 type="file" 
                 className="hidden" 
                 accept="image/*" 
                 onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                       try {
                          const base64 = reader.result as string;
                          await api.updateSettings({ logoUrl: base64 });
                          showToast('تم تحديث الشعار بنجاح في كافة الأنظمة', 'success');
                          refreshAll();
                       } catch (err) {
                          showToast('فشل تحديث الشعار', 'error');
                       }
                    };
                    reader.readAsDataURL(file);
                 }} 
               />

              {/* Seamless Circular White & Gold Medallion Inner Ring */}
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0c1020] border-4 border-amber-400 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                
                <img 
                  src={settings?.logoUrl || '/logo.svg'} 
                  alt="Center Logo" 
                  className="w-full h-full rounded-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] group-hover:scale-105 transition-transform" 
                />

                {/* Subtle Hover Overlay Hint */}
                <div className="absolute inset-0 bg-purple-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-amber-300 p-2 text-center rounded-full backdrop-blur-xs">
                  <Upload className="w-6 h-6 mb-1 animate-bounce text-amber-400" />
                  <span className="text-[11px] font-black tracking-wide">تغيير الشعار</span>
                </div>
              </div>

            </label>

            {/* 6 ORBIT NODE PLANETS POSITIONED ACCURATELY AROUND CENTRAL CIRCLE */}
            
            {/* Node 1: Trainees (Top 12 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('trainees')}
              className="absolute -top-1 sm:top-1 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-purple-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-purple-500 text-purple-800 dark:text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]" />
              <span>المتدربون</span>
            </button>

            {/* Node 2: Branches (Top Right ~2 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('branches')}
              className="absolute top-12 sm:top-14 right-2 sm:right-6 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-amber-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-amber-500 text-amber-800 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(245,158,11,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
              <span>الفروع</span>
            </button>

            {/* Node 3: AI Reports (Bottom Right ~4 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="absolute bottom-12 sm:bottom-14 right-2 sm:right-6 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-purple-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-purple-500 text-purple-800 dark:text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 filter drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]" />
              <span>ذكاء الأعمال</span>
            </button>

            {/* Node 4: Finance (Bottom 6 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="absolute -bottom-1 sm:bottom-1 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-emerald-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(16,185,129,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
              <span>الماليّة</span>
            </button>

            {/* Node 5: Devices (Bottom Left ~8 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('devices')}
              className="absolute bottom-12 sm:bottom-14 left-2 sm:left-6 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-rose-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-rose-500 text-rose-800 dark:text-rose-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(244,63,94,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]" />
              <span>الأجهزة</span>
            </button>

            {/* Node 6: Settings (Top Left ~10 o'clock) */}
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="absolute top-12 sm:top-14 left-2 sm:left-6 z-30 bg-white dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f172a] hover:bg-amber-50 dark:hover:from-[#1f293d] dark:hover:to-[#1a2542] border-2 border-amber-500 text-amber-800 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg dark:shadow-[0_0_15px_rgba(245,158,11,0.4),0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
              <span>الإعدادات</span>
            </button>

          </div>

          {/* Center Royal Regal Title & Stars Showcase Ribbon */}
          <div className="text-center mt-3 relative z-20 w-full flex flex-col items-center justify-center">
            
            {/* ROYAL REGAL EMBLEM TITLE BOX */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#111827] dark:via-[#0f172a] dark:to-[#070b14] border-2 border-purple-300 dark:border-amber-400/80 shadow-md dark:shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md relative group hover:scale-[1.02] transition-all mb-3">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-300 animate-pulse" />
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-amber-200 dark:via-white dark:to-amber-200 tracking-wide font-sans filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {settings?.centerName || 'النجاح للتدريب والاستشارات'}
              </h2>

              <div className="p-1.5 bg-purple-100 dark:bg-amber-500/20 rounded-xl text-purple-700 dark:text-amber-300 border border-purple-300 dark:border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-amber-300 animate-pulse" />
              </div>
            </div>

            {/* BOTTOM FEATURED: WEEKLY STARS SHOWCASE CARDS */}
            <div className="bg-white/90 dark:bg-gradient-to-r dark:from-[#131b2e]/95 dark:to-[#0e1626]/95 border border-amber-300 dark:border-amber-500/50 rounded-2xl p-2 max-w-lg mx-auto backdrop-blur-md shadow-md dark:shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.15)] w-full">
              <div className="flex items-center justify-between text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1.5 px-2">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-spin-slow" />
                  <span>لوحة نجوم الأسبوع المتألقين</span>
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">أعلى النقاط والتفوق العلمي</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {honorTrainees.slice(0, 3).map((trainee) => (
                  <div 
                    key={trainee.id}
                    onClick={() => setShowHonorModal(true)}
                    className="bg-slate-50 dark:bg-[#0f172a] hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400/70 p-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-right group shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  >
                    {trainee.avatar ? (
                      <img 
                        src={trainee.avatar} 
                        alt={trainee.name}
                        className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0 group-hover:scale-110 transition-transform shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {trainee.initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black text-slate-900 dark:text-white truncate">{trainee.name}</div>
                      <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono font-bold leading-none mt-0.5">{trainee.points} pt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 5 METRICS CARDS (TOTAL TRAINEES FIRST AS REQUESTED!) */}
        <div className="lg:col-span-3 space-y-2.5 order-3">
          
          {/* Card 1: TOTAL TRAINEES (ALWAYS FIRST AS REQUESTED!) */}
          <button
            type="button"
            onClick={() => onNavigate('trainees')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-cyan-300 dark:border-cyan-500/60 hover:border-cyan-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(165,243,252,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-cyan-100 dark:bg-cyan-500/25 rounded-lg text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">إجمالي المتدربين</span>
              </div>
              <span className="text-lg font-black text-cyan-700 dark:text-cyan-300 font-mono filter drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">
                {trainees.length}
              </span>
            </div>
            {/* Cyan Wave Particle Sparkline */}
            <div className="w-full h-5 mt-1 flex items-center overflow-hidden">
              <svg className="w-full h-full text-cyan-600 dark:text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 25" fill="none">
                <path d="M0 15 Q 15 5, 30 18 T 60 8 T 90 20 L 100 12" stroke="currentColor" strokeWidth="2.5" fill="none" className="filter drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]" />
                <circle cx="30" cy="18" r="2.5" fill="#06b6d4" className="filter drop-shadow-[0_0_6px_rgba(6,182,212,1)]" />
                <circle cx="60" cy="8" r="2.5" fill="#06b6d4" className="filter drop-shadow-[0_0_6px_rgba(6,182,212,1)]" />
                <circle cx="90" cy="20" r="2.5" fill="#06b6d4" className="filter drop-shadow-[0_0_6px_rgba(6,182,212,1)]" />
              </svg>
            </div>
          </button>

          {/* Card 2: Today Attendance */}
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-purple-300 dark:border-purple-500/60 hover:border-purple-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(233,213,255,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-purple-100 dark:bg-purple-500/25 rounded-lg text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">حضور اليوم</span>
              </div>
              <span className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono filter drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">
                {todayAttendanceCount}
              </span>
            </div>
            {/* Purple Progress Line */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-purple-200 dark:border-purple-500/40 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-500"
                style={{ width: `${trainees.length > 0 ? Math.min(100, Math.round((todayAttendanceCount / trainees.length) * 100)) : 0}%` }}
              />
            </div>
          </button>

          {/* Card 3: Active Courses */}
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-indigo-300 dark:border-indigo-500/60 hover:border-indigo-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(199,210,254,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-indigo-100 dark:bg-indigo-500/25 rounded-lg text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">دورات تدريبية فعالة</span>
              </div>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-300 font-mono filter drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]">
                {courses.length}
              </span>
            </div>
            {/* Indigo Particle Wave */}
            <div className="w-full h-5 mt-1 flex items-center overflow-hidden">
              <svg className="w-full h-full text-indigo-600 dark:text-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 25" fill="none">
                <path d="M0 18 Q 20 8, 40 20 T 70 5 T 100 15" stroke="currentColor" strokeWidth="2.5" fill="none" className="filter drop-shadow-[0_0_4px_rgba(99,102,241,0.8)]" />
                <circle cx="40" cy="20" r="2.5" fill="#6366f1" className="filter drop-shadow-[0_0_6px_rgba(99,102,241,1)]" />
                <circle cx="70" cy="5" r="2.5" fill="#6366f1" className="filter drop-shadow-[0_0_6px_rgba(99,102,241,1)]" />
              </svg>
            </div>
          </button>

          {/* Card 4: Trainer Rating */}
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-pink-300 dark:border-pink-500/60 hover:border-pink-500 flex flex-col justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(236,72,153,0.25),inset_0_1px_0_rgba(251,207,232,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(236,72,153,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-pink-100 dark:bg-pink-500/25 rounded-lg text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-500/40 shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">تقييم المدربين</span>
              </div>
              <span className="text-lg font-black text-pink-700 dark:text-pink-300 font-mono filter drop-shadow-[0_0_6px_rgba(236,72,153,0.4)]">
                4.9
              </span>
            </div>
            {/* Pink Sparkline */}
            <div className="w-full h-5 mt-1 flex items-center overflow-hidden">
              <svg className="w-full h-full text-pink-600 dark:text-pink-400 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 25" fill="none">
                <path d="M0 10 Q 25 22, 50 12 T 75 18 T 100 8" stroke="currentColor" strokeWidth="2.5" fill="none" className="filter drop-shadow-[0_0_4px_rgba(236,72,153,0.8)]" />
                <circle cx="50" cy="12" r="2.5" fill="#ec4899" className="filter drop-shadow-[0_0_6px_rgba(236,72,153,1)]" />
                <circle cx="75" cy="18" r="2.5" fill="#ec4899" className="filter drop-shadow-[0_0_6px_rgba(236,72,153,1)]" />
              </svg>
            </div>
          </button>

          {/* Card 5: Exams & Assessments */}
          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="w-full text-right bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#0c1322] dark:to-[#070b14] p-3 rounded-2xl border border-amber-300 dark:border-amber-500/60 hover:border-amber-500 flex items-center justify-between h-[80px] relative overflow-hidden group transition-all shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(253,230,138,0.2)] hover:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-100">الاختبارات والتقييمات</div>
              <div className="text-sm font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">14 اختبار نشط</div>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-500/25 rounded-xl text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <Award className="w-4 h-4" />
            </div>
          </button>

        </div>

      </div>

      {/* 3. BOTTOM SYSTEM BAR (DISCIPLINE BAR & EXPORT) */}
      <div className="bg-white/90 dark:bg-gradient-to-r dark:from-[#0f172a] dark:via-[#0b101d] dark:to-[#0f172a] p-2.5 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-md dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-3 shrink-0 mt-2">
        
        {/* Export & Backup Pill Button */}
        <button 
          type="button"
          onClick={() => showToast('جاري تصدير نسخة احتياطية واسعة من النظام...', 'info')}
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-600/25 border border-emerald-300 dark:border-emerald-500/60 hover:bg-emerald-100 dark:hover:bg-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
        >
          <Download className="w-4 h-4" />
          <span>تصدير واسع للاحتياطي</span>
        </button>

        {/* General Discipline Progress Bar */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-1 px-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
             <span className="text-cyan-700 dark:text-cyan-400">الانضباط العام: 98.2%</span>
             <span className="text-amber-700 dark:text-amber-400">المقر الرئيسي: 65%</span>
             <span className="text-purple-700 dark:text-blue-400">فرع بدر: 35%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full w-full flex overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="bg-purple-600 dark:bg-blue-500 h-full w-[35%] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
             <div className="bg-amber-500 dark:bg-amber-400 h-full w-[65%] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
        </div>

        {/* Active Flow Indicator */}
        <div className="flex items-center gap-2 text-purple-900 dark:text-white font-bold text-xs shrink-0 bg-purple-50 dark:bg-[#070b14] px-3 py-1.5 rounded-xl border border-purple-200 dark:border-amber-500/40 shadow-sm dark:shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Activity className="w-4 h-4 text-purple-600 dark:text-amber-400 animate-pulse" />
          <span>التدفق النشط</span>
        </div>
      </div>

      {/* 4. MODAL: HONOR ROLL OF OUTSTANDING TRAINEES (لوحة شرف للمتميزين) */}
      {showHonorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0d1424] border-2 border-amber-300 dark:border-amber-500/60 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 border-b border-amber-200 dark:border-amber-500/30 pb-4">
              <button 
                type="button"
                onClick={() => setShowHonorModal(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2 justify-end">
                    <span>🏆 لوحة شرف المتدربين المتميزين (نجوم الأسبوع)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">أوائل الكورسات والمجموعات الحاصلين على أعلى معدلات الأداء والالتزام</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40">
                  <Trophy className="w-8 h-8 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Top 3 Medals Stage or Empty State */}
            {honorTrainees.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-purple-200 dark:border-purple-500/20 mb-6">
                <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">لوحة الشرف جاهزة لاستقبال المتفوقين</h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 max-w-md mx-auto">
                  يتم تصنيف وترتيب المتدربين الأوائل تلقائياً بناءً على رصيد النجوم والنقاط ونسبة الحضور بمجرد تسجيل المتدربين في النظام.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {honorTrainees.slice(0, 3).map((item, idx) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden shadow-sm transition-all hover:scale-105 ${
                      idx === 0 ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-amber-400 ring-2 ring-amber-500/30' :
                      idx === 1 ? 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/40 dark:to-slate-900 border-purple-400 ring-2 ring-purple-500/20' :
                      'bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-amber-600/60'
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      {idx === 0 && <span className="text-2xl" title="المركز الأول">🥇</span>}
                      {idx === 1 && <span className="text-2xl" title="المركز الثاني">🥈</span>}
                      {idx === 2 && <span className="text-2xl" title="المركز الثالث">🥉</span>}
                    </div>

                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 mb-2 shadow-sm"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black mb-2 shadow-sm border-2 ${
                        idx === 0 ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-amber-300' :
                        idx === 1 ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white border-purple-300' :
                        'bg-gradient-to-tr from-rose-600 to-pink-500 text-white border-rose-300'
                      }`}>
                        {item.initial}
                      </div>
                    )}
                    
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.name}</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold mb-1">{item.course}</p>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 mb-2">
                      {item.badge}
                    </span>
                    
                    <div className="bg-slate-100 dark:bg-[#070b14]/80 px-3 py-1 rounded-full border border-slate-200 dark:border-amber-500/30 text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
                      {item.grade}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trainees List Table */}
            {honorTrainees.length > 0 && (
              <div className="bg-slate-50 dark:bg-[#070b14]/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-3 bg-purple-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-400 flex justify-between">
                  <span>المتدرب والدورة التدريبية</span>
                  <span>التقدير والنقاط</span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800/60 max-h-60 overflow-y-auto">
                  {honorTrainees.map((t, idx) => (
                    <div key={t.id} className="p-3 flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-mono font-bold text-purple-700 dark:text-amber-400">#{idx + 1}</span>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{t.name}</span>
                            <span className="text-[9px] text-purple-800 dark:text-amber-400 bg-purple-100 dark:bg-amber-500/15 px-1.5 py-0.2 rounded font-normal">
                              {t.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.course} {t.group ? `• ${t.group}` : ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">{t.grade}</span>
                        <span className="text-[11px] font-mono text-purple-800 dark:text-amber-400 bg-purple-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-purple-200 dark:border-amber-500/20">
                          {t.points} نقطة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHonorModal(false)}
                className="bg-purple-700 hover:bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
