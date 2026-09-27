import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Sparkles,
  Check,
  Crown,
  Trophy,
  Medal,
  Flame,
  Star,
  Layers,
  Wand2,
  RefreshCw,
  Sliders,
  Send,
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  Building2,
  Users
} from 'lucide-react';
import { Trainee, Group } from '../types';
import { captureElementToCanvas } from '../utils/captureUtils';

interface SocialPublishingStudioModalProps {
  trainees: Trainee[];
  groups: Group[];
  initialGroupId?: string;
  onClose: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export type PostLayout = 'podium_square' | 'story_portrait' | 'hero_spotlight' | 'honor_board';
export type VisualTheme = 'royal_gold' | 'cyber_neon' | 'emerald_prestige' | 'clean_light';
export type PostTone = 'enthusiastic' | 'prestigious' | 'motivational';

export const SocialPublishingStudioModal: React.FC<SocialPublishingStudioModalProps> = ({
  trainees,
  groups,
  initialGroupId,
  onClose,
  onShowToast
}) => {
  // Filters & Parameters
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || 'all');
  const [timeframe, setTimeframe] = useState<'today' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [postLayout, setPostLayout] = useState<PostLayout>('podium_square');
  const [visualTheme, setVisualTheme] = useState<VisualTheme>('royal_gold');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');
  
  // Customization Options
  const [customCenterName, setCustomCenterName] = useState<string>('مركز النجاح للتدريب والاستشارات');
  const [customTitle, setCustomTitle] = useState<string>('لوحة الشرف وتكريم نجوم الأسبوع 🌟');
  const [postTone, setPostTone] = useState<PostTone>('enthusiastic');
  const [postCaption, setPostCaption] = useState<string>('');
  const [showCenterStamp, setShowCenterStamp] = useState<boolean>(true);
  const [showPointsValue, setShowPointsValue] = useState<boolean>(true);
  const [showCelebrationSparkles, setShowCelebrationSparkles] = useState<boolean>(true);

  // Export State
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopiedImage, setIsCopiedImage] = useState<boolean>(false);
  const [isCopiedText, setIsCopiedText] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Grouped and sorted trainees
  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  const sortedTrainees = useMemo(() => {
    let list = [...trainees];
    if (selectedGroupId !== 'all') {
      list = list.filter(t => t.groupId === selectedGroupId);
    }
    return list.sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [trainees, selectedGroupId]);

  const top3 = useMemo(() => sortedTrainees.slice(0, 3), [sortedTrainees]);
  const top1 = sortedTrainees[0];

  // Set initial selected hero if spotlight
  useEffect(() => {
    if (top1 && !selectedTraineeId) {
      setSelectedTraineeId(top1.id);
    }
  }, [top1, selectedTraineeId]);

  const activeHero = useMemo(() => {
    return sortedTrainees.find(t => t.id === selectedTraineeId) || top1;
  }, [sortedTrainees, selectedTraineeId, top1]);

  // Current Date in Arabic
  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'full'
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('ar-EG');
    }
  }, []);

  // Generate engaging marketing copy for social media
  const generateCaption = () => {
    const groupLabel = activeGroup ? `بالمجموعة التدريبية (${activeGroup.name})` : 'بمركز النجاح';
    const timeLabel = timeframe === 'today' ? 'جلسة اليوم' : timeframe === 'weekly' ? 'هذا الأسبوع' : timeframe === 'monthly' ? 'هذا الشهر' : 'الترتيب العام';

    if (postLayout === 'hero_spotlight' && activeHero) {
      if (postTone === 'enthusiastic') {
        return `🔥 بطل الأسبوع يتألق في سماء الإبداع والتميز! 🌟\n\n` +
          `يسعدنا ويشرفنا في #${customCenterName.replace(/\s+/g, '_')} أن نبارك للبطل المتميز:\n` +
          `🥇 *${activeHero.fullName}*\n` +
          `لحصوله على صدارة التميز برصيد استثنائي (*${activeHero.points || 0} نقطة تميز ⭐*) ${groupLabel}.\n\n` +
          `👏 فخورون جداً بالتزامك وشغفك وإتقانك للتطبيق العملي. استمر في التألق!\n\n` +
          `💡 نصنع قادة الغد بالتعليم العملي المتقن والتحدي المستمر.\n` +
          `#مركز_النجاح #نجوم_المستقبل #برمجة_للأطفال #أبطال_التعليم #تعليم_عملي`;
      } else if (postTone === 'prestigious') {
        return `🎓 تكريم التميز والريادة | إنجازات الطلاب 🌟\n\n` +
          `تتشرف إدارة #${customCenterName.replace(/\s+/g, '_')} بالإشادة بالأداء الأكاديمي والعملي الرفيع للمتدرب:\n` +
          `🏆 *${activeHero.fullName}*\n` +
          `الذي حصد المركز الأول في تقييم ${timeLabel} بمجموع (*${activeHero.points || 0} نقطة*).\n\n` +
          `خالص التهاني لولي الأمر الكريم على هذا الغرس الطيب والتفوق المستحق.\n\n` +
          `📍 مركز النجاح للتدريب والتطوير\n` +
          `#لوحة_الشرف #التفوق_الأكاديمي #مركز_النجاح`;
      } else {
        return `🚀 "من جدّ وجد.. ومن زرع الشغف حصد الإبداع!" ✨\n\n` +
          `كل التحية والتقدير لنجمنا المتألق:\n` +
          `🌟 *${activeHero.fullName}*\n` +
          `على إصراره وتفانيه وتصدره قائمة النقاط بـ (*${activeHero.points || 0} نقطة*).\n\n` +
          `شاركونا التهنئة للبطل في التعليقات! 👇👏\n` +
          `#أبطال_النجاح #صناع_المستقبل #همة_نحو_القمة`;
      }
    }

    // Default Podium / Honor Board Caption
    const top1Name = top3[0]?.fullName || 'بطل المركز الأول';
    const top2Name = top3[1]?.fullName || 'بطل المركز الثاني';
    const top3Name = top3[2]?.fullName || 'بطل المركز الثالث';

    if (postTone === 'enthusiastic') {
      return `🎉 من قلب الحدث.. منصة تتويج نجوم ${timeLabel}! 🏆✨\n\n` +
        `ألف مبروك لأبطالنا المتألقين في #${customCenterName.replace(/\s+/g, '_')} ${groupLabel} الذين أثبتوا جدارتهم وإبداعهم:\n\n` +
        `🥇 المركز الأول الذهبي: *${top1Name}* (${top3[0]?.points || 0} ⭐)\n` +
        `🥈 المركز الثاني الفضي: *${top2Name}* (${top3[1]?.points || 0} ⭐)\n` +
        `🥉 المركز الثالث البرونزي: *${top3Name}* (${top3[2]?.points || 0} ⭐)\n\n` +
        `👏 كل الشكر والتقدير لأولياء الأمور الكرام على الدعم المتواصل، وفخورون جداً بكل طلابنا المبدعين!\n\n` +
        `شاركوا أبطالنا الفرحة في التعليقات بكلمة تشجيعية! 👇💬\n\n` +
        `#مركز_النجاح #لوحة_الشرف #أبطال_المستقبل #تميز_وإبداع #تعليم_تقني`;
    } else if (postTone === 'prestigious') {
      return `📜 إعلان لوحة الشرف الرسمية لطلاب ${timeLabel} 🌟\n\n` +
        `تعلن إدارة #${customCenterName.replace(/\s+/g, '_')} عن أسماء الأوائل المتصدرين لمنظومة نقاط التميز والتطبيق العملي ${groupLabel}:\n\n` +
        `👑 المركز الأول: *${top1Name}* (${top3[0]?.points || 0} نقطة)\n` +
        `🥈 المركز الثاني: *${top2Name}* (${top3[1]?.points || 0} نقطة)\n` +
        `🥉 المركز الثالث: *${top3Name}* (${top3[2]?.points || 0} نقطة)\n\n` +
        `نتمنى لجميع أبنائنا وبناتنا دوام التفوق والنجاح الباهر.\n\n` +
        `#مركز_النجاح #التفوق_الأكاديمي #لوحة_الشرف`;
    } else {
      return `💡 رحلة النجاح تبدأ بخطوة.. واليوم نحتفل بمن وصلوا للقمة بإصرارهم! 🚀\n\n` +
        `تهانينا الحارة لفرسان ${timeLabel} في #${customCenterName.replace(/\s+/g, '_')}:\n` +
        `🥇 *${top1Name}*\n` +
        `🥈 *${top2Name}*\n` +
        `🥉 *${top3Name}*\n\n` +
        `دمتم فخراً لنا ولمركزكم! 🌟\n` +
        `#أبطال_النجاح #صناع_المستقبل`;
    }
  };

  // Sync caption when parameters change
  useEffect(() => {
    setPostCaption(generateCaption());
  }, [postLayout, visualTheme, selectedGroupId, timeframe, selectedTraineeId, postTone, customCenterName]);

  // Capture Canvas Helper with 2x High Resolution
  const capturePosterCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!posterRef.current) return null;
    return await captureElementToCanvas(posterRef.current, {
      scale: 2.5,
      backgroundColor: visualTheme === 'clean_light' ? '#ffffff' : '#090d16'
    });
  };

  // 1. Download High-Res Poster Image
  const handleDownload = async () => {
    setIsGenerating(true);
    setActionNotice('⏳ جاري تجهيز الصورة بجودة فائقة 4K وتنزيلها...');
    try {
      const canvas = await capturePosterCanvas();
      if (!canvas) throw new Error('تعذر معالجة اللوحة');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const filename = `لوحة_تميز_فيسبوك_${(activeGroup?.name || 'المركز').replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setActionNotice('✅ تم تنزيل صورة التصميم بجودة فائقة!');
      if (onShowToast) onShowToast('تم تنزيل بطاقة السوشيال ميديا بدقة عالية! 💾', 'success');
    } catch (err: any) {
      console.error(err);
      setActionNotice('⚠️ حدث خطأ أثناء تجهيز الصورة');
      if (onShowToast) onShowToast('فشل تنزيل الصورة، يرجى المحاولة ثانية', 'error');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // 2. Copy Poster Image to Clipboard
  const handleCopyImage = async () => {
    setIsGenerating(true);
    setActionNotice('⏳ جاري نسخ صورة التصميم إلى الحافظة...');
    try {
      const canvas = await capturePosterCanvas();
      if (!canvas) throw new Error('تعذر نسخ اللوحة');

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopiedImage(true);
        setActionNotice('✅ تم نسخ صورة التصميم إلى الحافظة بنجاح! جاهزة للصق (Ctrl+V)');
        if (onShowToast) onShowToast('تم نسخ الصورة للحافظة! يمكنك لصقها الآن في فيسبوك أو واتساب 📋', 'success');
        setTimeout(() => setIsCopiedImage(false), 3000);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      setActionNotice('⚠️ تعذر النسخ المباشر للحافظة، يمكنك تنزيل الصورة كملف');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // 3. Copy Post Caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(postCaption);
      setIsCopiedText(true);
      setActionNotice('✅ تم نسخ نص المنشور بنجاح!');
      if (onShowToast) onShowToast('تم نسخ نص البوست للحافظة! 📝', 'success');
      setTimeout(() => setIsCopiedText(false), 3000);
    } catch {
      setActionNotice('⚠️ تعذر نسخ النص');
    }
    setTimeout(() => setActionNotice(null), 3000);
  };

  // 4. One-Click Real Facebook Publishing Flow
  const handlePublishFacebook = async () => {
    setIsGenerating(true);
    setActionNotice('🚀 جاري تجهيز المنشور وتنزيل الصورة وفتح صفحة فيسبوك...');

    // A. Copy caption to clipboard so trainer can instantly paste
    try {
      await navigator.clipboard.writeText(postCaption);
      setIsCopiedText(true);
    } catch {}

    // B. Download the rendered poster image
    try {
      const canvas = await capturePosterCanvas();
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `بوست_فيسبوك_${(activeGroup?.name || 'النجاح').replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Also copy image to clipboard if possible
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          await navigator.clipboard.write([
            new (window as any).ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopiedImage(true);
        }
      }
    } catch (e) {
      console.warn('Image prep error:', e);
    }

    // C. Open Facebook Composer / Page Publisher directly
    const facebookUrl = 'https://www.facebook.com/';
    window.open(facebookUrl, '_blank');

    setIsGenerating(false);
    setActionNotice('✨ تم فتح فيسبوك! تم نسخ النص تلقائياً وتنزيل الصورة لجهازك لترفقها فوراً!');
    if (onShowToast) onShowToast('تم فتح فيسبوك وتجهيز النص والصورة للنشر فوراً! 🚀', 'success');
    setTimeout(() => setActionNotice(null), 6000);
  };

  // 5. One-Click WhatsApp Sharing Flow
  const handleShareWhatsApp = async () => {
    setIsGenerating(true);
    setActionNotice('⏳ جاري تجهيز المشاركة على الواتساب...');
    
    // Download and copy image in background
    try {
      const canvas = await capturePosterCanvas();
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `بطاقة_تميز_${(activeGroup?.name || 'النجاح').replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {}

    const targetUrl = activeGroup?.whatsappGroupLink?.trim()
      ? (activeGroup.whatsappGroupLink.trim().startsWith('http') ? activeGroup.whatsappGroupLink.trim() : `https://${activeGroup.whatsappGroupLink.trim()}`)
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(postCaption)}`;

    window.open(targetUrl, '_blank');
    setIsGenerating(false);
    setActionNotice('🚀 تم فتح الواتساب بالنص المكتوب وتنزيل صورة المنشور بجودة عالية!');
    if (onShowToast) onShowToast('تم فتح الواتساب وتجهيز بطاقة التميز بنجاح! 📲', 'success');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Helper styles for themes
  const themeStyles = {
    royal_gold: {
      cardBg: 'bg-gradient-to-b from-[#0b101b] via-[#101726] to-[#080c14] text-slate-100 border-2 border-[#f59e0b]/80 shadow-[0_0_50px_rgba(245,158,11,0.2)]',
      headerGradient: 'from-amber-300 via-yellow-200 to-amber-400',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg',
      podium1: 'border-2 border-amber-400 bg-gradient-to-b from-amber-500/25 via-amber-950/70 to-slate-950/95 text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.35)]',
      podium2: 'border-2 border-slate-300 bg-gradient-to-b from-slate-400/20 via-slate-800/80 to-slate-950/95 text-slate-100 shadow-[0_0_20px_rgba(203,213,225,0.2)]',
      podium3: 'border-2 border-amber-700 bg-gradient-to-b from-amber-800/20 via-slate-800/80 to-slate-950/95 text-amber-400 shadow-[0_0_20px_rgba(180,83,9,0.2)]',
      watermark: 'border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-amber-400/30 text-amber-200'
    },
    cyber_neon: {
      cardBg: 'bg-gradient-to-b from-[#060814] via-[#0c102b] to-[#1a082b] text-cyan-100 border-2 border-cyan-500/80 shadow-[0_0_50px_rgba(6,182,212,0.25)]',
      headerGradient: 'from-cyan-300 via-fuchsia-300 to-indigo-300',
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 font-black',
      podium1: 'border-2 border-cyan-400 bg-gradient-to-b from-cyan-500/25 to-slate-950/95 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.35)]',
      podium2: 'border-2 border-fuchsia-400 bg-gradient-to-b from-fuchsia-500/20 to-slate-950/95 text-fuchsia-300',
      podium3: 'border-2 border-indigo-400 bg-gradient-to-b from-indigo-500/20 to-slate-950/95 text-indigo-300',
      watermark: 'border-2 border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
    },
    emerald_prestige: {
      cardBg: 'bg-gradient-to-b from-[#021f15] via-[#062c20] to-[#041710] text-emerald-100 border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      headerGradient: 'from-emerald-300 via-teal-200 to-amber-300',
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black',
      podium1: 'border-2 border-emerald-400 bg-gradient-to-b from-emerald-500/30 to-slate-950/95 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,0.35)]',
      podium2: 'border-2 border-teal-400 bg-gradient-to-b from-teal-500/20 to-slate-950/95 text-teal-300',
      podium3: 'border-2 border-amber-600 bg-gradient-to-b from-amber-700/20 to-slate-950/95 text-amber-300',
      watermark: 'border-2 border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
    },
    clean_light: {
      cardBg: 'bg-gradient-to-br from-white via-slate-50 to-amber-50/60 text-slate-900 border-2 border-amber-400 shadow-2xl',
      headerGradient: 'from-amber-600 via-yellow-600 to-orange-600',
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-500 text-slate-950 font-black',
      podium1: 'border-2 border-amber-400 bg-amber-50/95 text-amber-950 shadow-lg',
      podium2: 'border-2 border-slate-300 bg-slate-100/95 text-slate-900',
      podium3: 'border-2 border-orange-300 bg-orange-50/95 text-orange-950',
      watermark: 'border-2 border-amber-300 bg-amber-100 text-amber-950'
    }
  }[visualTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none font-sans" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>استوديو النشر على فيسبوك والسوشيال ميديا 📢</span>
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs font-mono">
                  Social Studio Pro 🚀
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                توليد بطاقات وبوستات احترافية للإنجازات والتميز مع محتوى تسويقي جاهز للنشر الفوري
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all active:scale-90"
            title="إغلاق الاستوديو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns on Large Screens) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Controls, Theme & AI Copywriting Studio (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs order-2 lg:order-1">
            
            {/* Quick Presets & Scope Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between font-black text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  إعدادات ونطاق التتويج:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {sortedTrainees.length} متدرب
                </span>
              </div>

              {/* Group Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  المجموعة أو الدورة التدريبية:
                </label>
                <div className="relative">
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pr-3 pl-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="all">🌐 جميع المجموعات والطلاب بالمركز</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        👥 {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Timeframe selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  الفترة الزمنية للإنجاز:
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl">
                  {[
                    { id: 'today', label: 'اليومي ⚡' },
                    { id: 'weekly', label: 'الأسبوعي 🏆' },
                    { id: 'monthly', label: 'الشهري 🌟' },
                    { id: 'all', label: 'الشامل 👑' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeframe(t.id as any)}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        timeframe === t.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Layout & Format Selector */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                شكل وقالب التصميم (Post Format):
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'podium_square', label: '🏆 منصة الثلاثة الأوائل (بوست مربع 1:1)', desc: 'الأكثر شعبية لفيسبوك' },
                  { id: 'story_portrait', label: '📱 ستوري / ريلز عمودي (9:16)', desc: 'ملائم لستوري وإنستغرام' },
                  { id: 'hero_spotlight', label: '🥇 بطاقة بطل الأسبوع الفردية', desc: 'تسليط الضوء على المتصدر' },
                  { id: 'honor_board', label: '📜 لوحة شرف المتفوقين (Top 5)', desc: 'قائمة الأوائل الشاملة' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPostLayout(item.id as PostLayout)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                      postLayout === item.id
                        ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-400/50 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-[11px] font-black">{item.label}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Single Hero Selector if in Spotlight Mode */}
              {postLayout === 'hero_spotlight' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    اختر الطالب المُراد تكريمه في البوستر:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTraineeId}
                      onChange={(e) => setSelectedTraineeId(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pr-3 pl-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      {sortedTrainees.map((t, idx) => (
                        <option key={t.id} value={t.id}>
                          #{idx + 1} - {t.fullName} ({t.points || 0} نقطة)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Visual Aesthetic / Theme Selector */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                طابع وهوية الألوان (Design Theme):
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'royal_gold', label: '👑 الذهب الملكي الفاخر', color: 'bg-amber-500 text-slate-950' },
                  { id: 'cyber_neon', label: '🚀 النيون التكنولوجي', color: 'bg-cyan-500 text-slate-950' },
                  { id: 'emerald_prestige', label: '🎖️ الأكاديمي الزمردي', color: 'bg-emerald-600 text-white' },
                  { id: 'clean_light', label: '☀️ الصباحي الأبيض والأصفر', color: 'bg-amber-100 text-amber-950 border border-amber-300' }
                ].map(th => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setVisualTheme(th.id as VisualTheme)}
                    className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      visualTheme === th.id
                        ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 font-bold ring-2 ring-amber-400/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{th.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${th.color} shadow-xs shrink-0`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Smart AI Copywriter & Caption Editor */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-indigo-500" />
                  محرر بوست الفيسبوك الذكي:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'enthusiastic', label: 'حماسي 🔥' },
                    { id: 'prestigious', label: 'رسمي 📜' },
                    { id: 'motivational', label: 'ملهم ✨' }
                  ].map(tn => (
                    <button
                      key={tn.id}
                      type="button"
                      onClick={() => setPostTone(tn.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        postTone === tn.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tn.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                rows={4}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs leading-relaxed font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                placeholder="اكتب أو عدل نص البوست هنا..."
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopiedText
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopiedText ? 'تم نسخ النص! ✅' : 'نسخ نص المنشور 📝'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostCaption(generateCaption())}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
                  title="إعادة توليد النص"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Visual Stage & One-Click Publishing (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-between space-y-5 order-1 lg:order-2">
            
            {/* Visual Canvas Container */}
            <div className="w-full flex justify-center items-center py-2">
              <div 
                ref={posterRef}
                className={`relative overflow-hidden rounded-3xl border-4 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl ${themeStyles.cardBg} ${
                  postLayout === 'story_portrait' 
                    ? 'w-full max-w-[340px] aspect-[9/16] min-h-[580px]' 
                    : postLayout === 'podium_square'
                    ? 'w-full max-w-[480px] aspect-square min-h-[440px]'
                    : postLayout === 'hero_spotlight'
                    ? 'w-full max-w-[420px] aspect-[4/5] min-h-[460px]'
                    : 'w-full max-w-[500px] min-h-[480px]'
                }`}
              >
                {/* Decorative Background Lighting Accents */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Card Top Branding Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md border border-white/30 text-lg">
                      🏆
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-black bg-gradient-to-r ${themeStyles.headerGradient} bg-clip-text text-transparent leading-tight`}>
                        {customCenterName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <span>{activeGroup ? activeGroup.name : 'لوحة الشرف العامة'}</span>
                        <span>•</span>
                        <span>{timeframe === 'today' ? 'إنجاز اليوم' : timeframe === 'weekly' ? 'نجوم الأسبوع' : 'المتصدرين'}</span>
                      </p>
                    </div>
                  </div>

                  {showCenterStamp && (
                    <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black border font-mono shadow-xs ${themeStyles.watermark}`}>
                      ★ تميز معتمد
                    </div>
                  )}
                </div>

                {/* Dynamic Content based on Post Layout */}

                {/* 1. Podium 3 Champions Layout */}
                {postLayout === 'podium_square' && (
                  <div className="relative z-10 my-auto py-4 space-y-4">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                        <Crown className="w-4 h-4 text-slate-950" />
                        <span>منصة الشرف والتتويج الذهبية</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {customTitle}
                      </h3>
                    </div>

                    {/* 3 Pillars: Silver (2nd) - Gold (1st) - Bronze (3rd) */}
                    <div className="grid grid-cols-3 gap-2.5 items-end pt-2">
                      
                      {/* 2nd Place (Silver) */}
                      <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center relative ${themeStyles.podium2}`}>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-slate-300 mb-2 shadow-md bg-slate-800 flex items-center justify-center font-black text-base">
                          {top3[1]?.photoUrl ? (
                            <img src={top3[1].photoUrl} alt={top3[1]?.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{top3[1]?.fullName?.slice(0, 1) || '🥈'}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 mb-1">
                          🥈 المركز الثاني
                        </span>
                        <h5 className="font-black text-xs truncate max-w-full text-white">
                          {top3[1]?.fullName || 'البطل الثاني'}
                        </h5>
                        {showPointsValue && (
                          <span className="text-[11px] font-mono font-black text-slate-300 mt-1">
                            {top3[1]?.points || 0} ⭐
                          </span>
                        )}
                      </div>

                      {/* 1st Place (Gold Champion) - Highest */}
                      <div className={`p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col items-center text-center relative transform -translate-y-2 scale-105 ${themeStyles.podium1}`}>
                        <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow-md flex items-center gap-1">
                          <Crown className="w-3 h-3" /> البطل
                        </div>
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-3 border-amber-400 mb-2 shadow-xl bg-amber-950 flex items-center justify-center font-black text-xl">
                          {top3[0]?.photoUrl ? (
                            <img src={top3[0].photoUrl} alt={top3[0]?.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-amber-300">{top3[0]?.fullName?.slice(0, 1) || '🥇'}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 mb-1">
                          🥇 المركز الأول
                        </span>
                        <h5 className="font-black text-sm truncate max-w-full text-white">
                          {top3[0]?.fullName || 'البطل المتصدر'}
                        </h5>
                        {showPointsValue && (
                          <span className="text-xs font-mono font-black text-amber-400 mt-1">
                            {top3[0]?.points || 0} نقطة ⭐
                          </span>
                        )}
                      </div>

                      {/* 3rd Place (Bronze) */}
                      <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center relative ${themeStyles.podium3}`}>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-700 mb-2 shadow-md bg-slate-800 flex items-center justify-center font-black text-base">
                          {top3[2]?.photoUrl ? (
                            <img src={top3[2].photoUrl} alt={top3[2]?.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{top3[2]?.fullName?.slice(0, 1) || '🥉'}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-700 text-white mb-1">
                          🥉 المركز الثالث
                        </span>
                        <h5 className="font-black text-xs truncate max-w-full text-white">
                          {top3[2]?.fullName || 'البطل الثالث'}
                        </h5>
                        {showPointsValue && (
                          <span className="text-[11px] font-mono font-black text-amber-500 mt-1">
                            {top3[2]?.points || 0} ⭐
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. Story / Reels Vertical 9:16 Layout */}
                {postLayout === 'story_portrait' && (
                  <div className="relative z-10 my-auto py-4 space-y-5 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center text-3xl shadow-xl border-2 border-white">
                      👑
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 backdrop-blur-md">
                        🌟 نجم {timeframe === 'today' ? 'اليوم' : 'الأسبوع'} 🌟
                      </span>
                      <h3 className="text-xl font-black text-white mt-2 leading-tight">
                        {activeHero?.fullName || 'بطل التميز'}
                      </h3>
                      <p className="text-xs text-amber-300 font-bold mt-1">
                        {activeHero?.groupName || 'المجموعة التدريبية'}
                      </p>
                    </div>

                    <div className="w-28 h-28 rounded-3xl mx-auto overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-800 flex items-center justify-center text-4xl font-black">
                      {activeHero?.photoUrl ? (
                        <img src={activeHero.photoUrl} alt={activeHero?.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{activeHero?.fullName?.slice(0, 1) || '🌟'}</span>
                      )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl max-w-[200px] mx-auto">
                      <span className="text-[10px] text-slate-300 block font-bold">رصيد نقاط التميز</span>
                      <span className="text-2xl font-black font-mono text-amber-400">
                        {activeHero?.points || 0} ⭐
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Single Hero Spotlight Layout */}
                {postLayout === 'hero_spotlight' && (
                  <div className="relative z-10 my-auto py-4 space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-md">
                      <Medal className="w-4 h-4" />
                      <span>وسام بطل الأسبوع الذهبي</span>
                    </div>

                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                      <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-800 flex items-center justify-center text-3xl font-black">
                        {activeHero?.photoUrl ? (
                          <img src={activeHero.photoUrl} alt={activeHero?.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-300">{activeHero?.fullName?.slice(0, 1) || '🥇'}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                        🥇
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-2xl font-black text-white">
                        {activeHero?.fullName || 'البطل المتصدر'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        كود المتدرب: {activeHero?.code || '---'} | {activeHero?.groupName || 'المجموعة الأساسية'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                      <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 block font-bold">الرصيد الكلي</span>
                        <span className="text-base font-black font-mono text-amber-400">{activeHero?.points || 0} نقطة</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 block font-bold">المستوى</span>
                        <span className="text-xs font-black text-emerald-400">متفوق أسطوري 🌟</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Honor Board Top 5 List Layout */}
                {postLayout === 'honor_board' && (
                  <div className="relative z-10 my-auto py-3 space-y-3">
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        لوحة الشرف للأوائل المتفوقين 🌟
                      </h3>
                      <p className="text-[11px] text-slate-400">{timeframe === 'today' ? 'أبطال اليوم' : 'أبطال الأسبوع'}</p>
                    </div>

                    <div className="space-y-2">
                      {sortedTrainees.slice(0, 5).map((t, idx) => (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                            idx === 0
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : idx === 1
                              ? 'bg-slate-400/15 border-slate-300 text-slate-200'
                              : idx === 2
                              ? 'bg-amber-800/15 border-amber-700 text-amber-400'
                              : 'bg-white/5 border-white/10 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center font-black text-xs font-mono">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-black">{t.fullName}</span>
                          </div>
                          <span className="font-mono font-black text-xs">
                            {t.points || 0} ⭐
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Bottom Stamp & Verification */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {formattedDate}
                  </span>
                  <span className="font-bold text-amber-300/80">
                    #مركز_النجاح_للأبطال 🚀
                  </span>
                </div>

              </div>
            </div>

            {/* Action Notice Bar */}
            {actionNotice && (
              <div className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold text-center animate-fadeIn shadow-md">
                {actionNotice}
              </div>
            )}

            {/* Direct 1-Click Publishing & Action Toolbar */}
            <div className="w-full bg-slate-50 dark:bg-slate-950/80 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  أزرار النشر السريع والمباشر (1-Click Actions):
                </span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  دقة فائقة جاهزة للرفع ⚡
                </span>
              </div>

              {/* Main Primary Publishing Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Facebook Instant Publisher */}
                <button
                  type="button"
                  onClick={handlePublishFacebook}
                  disabled={isGenerating}
                  className="py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>نشر فوري على فيسبوك 📢</span>
                </button>

                {/* 2. WhatsApp Instant Publisher */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  disabled={isGenerating}
                  className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>مشاركة فورية على الواتساب 📲</span>
                </button>
              </div>

              {/* Secondary Utility Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل PNG 💾</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopiedImage
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopiedImage ? 'تم نسخ الصورة! ✅' : 'نسخ الصورة 📋'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopiedText
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopiedText ? 'تم نسخ النص! ✅' : 'نسخ النص 📝'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
