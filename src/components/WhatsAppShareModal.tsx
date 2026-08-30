import React, { useState } from 'react';
import { Share2, X, Download, Printer, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';

export const WhatsAppShareModal = ({ activeTrainee, onClose, showToast }: any) => {
  const [cardType, setCardType] = useState<'congrats' | 'receipt' | 'certificate' | 'report' | 'star'>('congrats');
  const [recipientType, setRecipientType] = useState<'parent' | 'student' | 'group'>('parent');
  const targetPhone = recipientType === 'parent' ? (activeTrainee.parentPhone || activeTrainee.phone) : (activeTrainee.phone || '');

  const getCardTitle = () => {
    switch(cardType) {
      case 'congrats': return '🌟 كارت تهنئة وترحيب رسمي';
      case 'receipt': return '🧾 إيصال سداد رسوم التدريب';
      case 'certificate': return '📜 شهادة إتمام الدورة المعتمدة';
      case 'report': return '📊 تقرير الأداء التدريبي';
      case 'star': return '⭐ نجم المحاضرة وأوسمة التميز (المركز الأول)';
    }
  };

  const getDefaultMsg = () => {
    switch(cardType) {
      case 'congrats':
        return `🎓 مركز النجاح للتدريب والاستشارات يهنئ الطالب/ة ${activeTrainee.fullName} بمناسبة انضمامه/ا للدورة المعتمدة. نتمنى لك دوام التوفيق والنجاح والتألق! 🌟`;
      case 'receipt':
        return `🧾 مركز النجاح للتدريب - إيصال سداد رسوم:\nاسم المتدرب: ${activeTrainee.fullName}\nالكود: ${activeTrainee.code}\nالمبلغ المسدد: ${activeTrainee.initialPayment || 0} ج.م\nالمتبقي: ${Math.max(0, (activeTrainee.feeAmount || 0) - (activeTrainee.discountAmount || 0) - (activeTrainee.initialPayment || 0))} ج.م\nشكراً لثقتكم بنا! 🏛️`;
      case 'certificate':
        return `📜 مبروك! حصل المتدرب/ة ${activeTrainee.fullName} (كود: ${activeTrainee.code}) على شهادة إتمام الدورة التدريبية بنجاح من مركز النجاح للتدريب والاستشارات. نسأل الله لك مزيداً من التفوق! 🏆`;
      case 'report':
        return `📊 تقرير الأداء الأسبوعي/الشهري لمركز النجاح للتدريب:\nاسم المتدرب: ${activeTrainee.fullName}\nمجموع النقاط والنجوم: ${activeTrainee.points || 0} نقطة\nالحالة: منتظم ومتميز جداً في التطبيق العملي. 🚀`;
      case 'star':
        return `⭐ تهنئة خاصة من مركز النجاح للتدريب: حصل المتدرب المتميز ${activeTrainee.fullName} على المركز الأول / نجم المحاضرة بناءً على سرعة ودقة التفاعل العملي! 🏆🎉`;
    }
  };

  const handleDownloadJpg = async () => {
    const element = document.getElementById('branded-card-preview');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#090d16' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${cardType}_${activeTrainee.code || 'trainee'}.jpg`;
      link.click();
      showToast('تم تحميل المستند/الإيصال بصيغة JPG بنجاح! 🖼️', 'success');
    } catch (err) {
      showToast('فشل تحميل الصورة', 'error');
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('branded-card-preview');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#090d16' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <title>مستند رسمي - ${activeTrainee.fullName}</title>
            <style>
              body { background: #fff; color: #000; font-family: Tahoma, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
              .print-btn { margin-top: 20px; padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; }
              @media print { .print-btn { display: none; } }
            </style>
          </head>
          <body>
            <h3 style="margin-bottom: 15px; color: #1e293b;">مركز النجاح للتدريب والاستشارات - المستند الرسمي</h3>
            <img src="${imgData}" />
            <button class="print-btn" onclick="window.print()">طباعة أو حفظ بصيغة PDF 📄</button>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast('تم تجهيز المستند للطباعة والحفظ بصيغة PDF! 📄', 'success');
      }
    } catch (err) {
      showToast('فشل تجهيز ملف PDF', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] backdrop-blur-xl p-4 md:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/60 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
        
        {/* Left Side: Controls & Sharing Options */}
        <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-indigo-400" />
              مشاركة وإصدار
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">نوع المستند / الكارت</label>
              <select 
                value={cardType} 
                onChange={e => setCardType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="congrats">🌟 كارت التهنئة (انضمام جديد)</option>
                <option value="receipt">🧾 إيصال سداد (ماليات)</option>
                <option value="star">⭐ وسام التميز (نجم المحاضرة)</option>
                <option value="report">📊 تقرير تفوق (متابعة دراسية)</option>
                <option value="certificate">📜 شهادة إتمام الدورة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">إرسال إلى (WhatsApp)</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setRecipientType('parent')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${recipientType === 'parent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  ولي الأمر
                </button>
                <button 
                  onClick={() => setRecipientType('student')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${recipientType === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  الطالب مباشرة
                </button>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
              <label className="block text-xs font-bold text-emerald-500/70 mb-2">نص رسالة الواتساب الجاهزة</label>
              <textarea 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 min-h-[120px] outline-none"
                defaultValue={getDefaultMsg()}
              />
            </div>

            <div className="pt-4 grid grid-cols-2 gap-3">
              <a 
                href={`https://wa.me/${targetPhone?.startsWith('0') ? '2' + targetPhone : targetPhone}?text=${encodeURIComponent(getDefaultMsg())}`}
                target="_blank" rel="noopener noreferrer"
                className="col-span-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Share2 className="w-5 h-5" />
                إرسال للواتساب (نص فقط)
              </a>
              <button 
                onClick={handleDownloadJpg}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                تصدير JPG
              </button>
              <button 
                onClick={handleDownloadPdf}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                طباعة / PDF
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              * لإرسال الكارت مع النص: قم بتصدير الكارت كصورة (JPG) أولاً، ثم اضغط إرسال للواتساب، وقم بإرفاق الصورة المحملة قبل الإرسال.
            </p>
          </div>
        </div>

        {/* Right Side: The Branded Card Preview */}
        <div className="w-full md:w-[55%] bg-slate-950 p-6 flex flex-col items-center justify-center border-r border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="text-center mb-6 z-10">
            <span className="bg-slate-800/80 border border-slate-700 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Live Preview 🔴
            </span>
          </div>

          <div 
            id="branded-card-preview"
            className="w-full max-w-md bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#020617] rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden"
          >
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-500/10 to-transparent blur-3xl rounded-full" />
            
            {/* Header / Logo */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                  <span className="font-black text-white text-xl">ن</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-base">مركز النجاح للتدريب</h3>
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider">TRAINING & CONSULTING</span>
                </div>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>

            {/* Content Body */}
            <div className="text-center space-y-6 relative z-10 my-10">
              <div className="inline-block px-4 py-1.5 bg-slate-800/80 border border-slate-700 text-indigo-300 rounded-full text-xs font-bold mb-2">
                {getCardTitle()}
              </div>
              
              <h1 className="text-3xl font-black text-white leading-tight">
                {activeTrainee.fullName}
              </h1>
              
              <div className="flex items-center justify-center gap-4">
                <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="block text-[9px] text-slate-500 mb-0.5">كود الطالب</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{activeTrainee.code || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="block text-[9px] text-slate-500 mb-0.5">المرحلة الدراسية</span>
                  <span className="text-sm font-bold text-slate-200">{activeTrainee.level || 'غير محدد'}</span>
                </div>
              </div>

              {cardType === 'receipt' && (
                <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-right space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">المبلغ المسدد</span>
                    <span className="text-lg font-black text-emerald-400">{activeTrainee.initialPayment || 0} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">الرصيد المتبقي</span>
                    <span className="text-base font-bold text-rose-400">{Math.max(0, (activeTrainee.feeAmount || 0) - (activeTrainee.discountAmount || 0) - (activeTrainee.initialPayment || 0))} ج.م</span>
                  </div>
                </div>
              )}

              {cardType === 'report' && (
                <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-right space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">إجمالي النقاط</span>
                    <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      {activeTrainee.points || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold">مستند رسمي معتمد</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
