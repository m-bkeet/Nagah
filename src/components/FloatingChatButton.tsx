import React, { useState } from 'react';
import { MessageCircle, Bot, Sparkles, Send, Phone, X, HelpCircle, MessageSquare } from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';

export const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'whatsapp' | 'sms' | 'tutor' | 'bot'>('menu');
  const [messageText, setMessageText] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const { settings, showToast } = useCenter();
  const { user } = useAuth();

  const getRoleWelcome = () => {
    if (!user) return 'أهلاً بك في بوابة الدعم الذكي لمركز النجاح للتدريب.';
    switch (user.role) {
      case 'super_admin':
        return `أهلاً بك يا سيادة المدير العام (${user.fullName})! أنا مساعدك الذكي الشامل لإدارة مركز النجاح.`;
      case 'branch_manager':
        return `أهلاً بك يا مدير الفرع (${user.fullName})! أنا مساعدك الذكي لمتابعة نشاط الفرع والمتدربين.`;
      case 'accountant':
        return `أهلاً بك يا أستاذنا المحاسب (${user.fullName})! أنا مساعدك الذكي للشؤون المالية والخزينة والسندات.`;
      case 'receptionist':
        return `أهلاً بك يا مسؤول الاستقبال (${user.fullName})! أنا مساعدك لتسجيل المتدربين والرد على الاستفسارات.`;
      case 'trainer':
        return `أهلاً بك يا أستاذنا المحاضر (${user.fullName})! أنا مساعدك لمتابعة المحاضرات والتقييمات.`;
      default:
        return `أهلاً بك يا ${user.fullName}! أنا مساعدك الذكي في مركز النجاح.`;
    }
  };

  const [botMessages, setBotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: getRoleWelcome() }
  ]);
  const [botInput, setBotInput] = useState('');

  const handleSendWhatsApp = () => {
    const phone = recipientPhone || settings?.phone || '201001500686';
    const text = encodeURIComponent(messageText || 'مرحباً، أستفسر عن الدورات والخدمات التدريبية في مركز النجاح.');
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    showToast('جاري فتح محادثة الواتساب المباشرة...', 'success');
  };

  const handleSendSMS = () => {
    const phone = recipientPhone || settings?.phone || '01001500686';
    const text = encodeURIComponent(messageText || 'مرحباً، أستفسر عن مركز النجاح للتدريب.');
    window.open(`sms:${phone}?body=${text}`, '_blank');
    showToast('جاري فتح تطبيق الرسائل النصية SMS...', 'success');
  };

  const handleSendBotMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!botInput.trim()) return;
    const userText = botInput;
    setBotMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setBotInput('');

    setTimeout(() => {
      let reply = 'لقد تلقيت استفسارك وسأقوم بمساعدتك في ذلك فوراً.';
      if (userText.includes('إيرادات') || userText.includes('الخزينة') || userText.includes('مالية')) {
        reply = 'إيرادات الخزينة اليوم ممتازة ولله الحمد. يمكنك متابعة السندات والتقارير المالية من قسم الشؤون المالية.';
      } else if (userText.includes('متدرب') || userText.includes('طلاب')) {
        reply = 'لدينا قائمة نشطة من المتدربين المسجلين في الدورات الحالية، يمكنك مراجعتها عبر قسم المتدربين.';
      } else if (userText.includes('دورة') || userText.includes('كورسات')) {
        reply = 'يمكنك إضافة وإدارة الدورات والمجموعات بسهولة من قسم الدورات والبرامج.';
      } else if (userText.includes('مرحبا') || userText.includes('السلام')) {
        reply = `أهلاً بك يا ${user.fullName || 'زميلنا العزيز'}! أنا تحت خدمتكم دائماً.`;
      }
      setBotMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[999] flex flex-col items-end">
      {/* Floating Chat / Support Widget Box */}
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[92vw] h-[500px] bg-gradient-to-br from-slate-900/95 via-[#0f172a]/95 to-[#070b14]/95 border border-amber-500/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-xl">
          
          {/* Header */}
          <div className="bg-slate-900/95 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-300">مركز المساعدة والشات بوت الذكي</h3>
                <p className="text-[10px] text-slate-400">{user ? `الصلاحية: ${user.fullName}` : 'دعم فني وتواصل مباشر'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'menu' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'hover:bg-slate-800'}`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>الرئيسية</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow font-black' : 'hover:bg-slate-800'}`}
            >
              <Phone className="w-3 h-3" />
              <span>واتساب</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tutor')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'tutor' ? 'bg-purple-600 text-white shadow font-black' : 'hover:bg-slate-800'}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>الشرح</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bot')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'bot' ? 'bg-cyan-600 text-white shadow font-black' : 'hover:bg-slate-800'}`}
            >
              <Bot className="w-3 h-3" />
              <span>الشات بوت</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 overflow-y-auto space-y-4 text-right flex-1 custom-scrollbar">
            {activeTab === 'menu' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 rounded-2xl p-3 text-center">
                  <h4 className="text-xs font-black text-amber-300 mb-1">أهلاً بك في نظام الدعم السريع والذكاء الاصطناعي</h4>
                  <p className="text-[11px] text-slate-300">{user?.role === 'super_admin' ? 'مرحباً بك يا مديرنا العام، جميع الصلاحيات مفعلة.' : 'اختر طريقة التواصل أو المساعدة المناسبة لك:'}</p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('whatsapp')}
                    className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 flex items-center gap-3 transition-all group cursor-pointer text-right"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">مراسلة واتساب مباشرة</h5>
                      <p className="text-[10px] text-slate-400">إرسال استفسار أو طلب عبر الواتساب</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('sms')}
                    className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-blue-950/40 border border-blue-500/30 hover:border-blue-500 flex items-center gap-3 transition-all group cursor-pointer text-right"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">مراسلة SMS سريعة</h5>
                      <p className="text-[10px] text-slate-400">إرسال رسالة نصية قصيرة للمركز</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tutor')}
                    className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-purple-950/40 border border-purple-500/30 hover:border-purple-500 flex items-center gap-3 transition-all group cursor-pointer text-right"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">مساعد الشرح والتدريس</h5>
                      <p className="text-[10px] text-slate-400">شرح تفاعلي وإرشادات ذكية للمناهج</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[11px] text-emerald-200">التواصل المباشر مع إدارة مركز النجاح عبر واتساب.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    value={recipientPhone || settings?.phone || '01001500686'}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">نص الرسالة</label>
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="اكتب رسالتك أو استفسارك هنا..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:border-emerald-500 outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>إرسال عبر واتساب الآن</span>
                </button>
              </div>
            )}

            {activeTab === 'sms' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-[11px] text-blue-200">إرسال رسالة نصية قصيرة SMS مباشرة عبر هاتفك.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">رقم الهاتف</label>
                  <input
                    type="text"
                    value={recipientPhone || settings?.phone || '01001500686'}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">نص الرسالة القصيرة</label>
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:border-blue-500 outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={handleSendSMS}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال رسالة SMS</span>
                </button>
              </div>
            )}

            {activeTab === 'tutor' && (
              <div className="space-y-3 text-right">
                <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-300 font-black text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>مساعد الشرح والتدريس التفاعلي</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    مساعد تفاعلي لتبسيط المناهج والدورات التدريبية للمتدربين حسب الصلاحيات.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">اسأل مساعد الشرح عن أي مفهوم:</label>
                  <textarea
                    rows={3}
                    placeholder="مثال: اشرح لي أساسيات التدريب أو كيفية إدارة الجلسة..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:border-purple-500 outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast('تم إرسال السؤال إلى مساعد الشرح الذكي، جاري جلب الإجابة...', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>بدء الشرح الفوري</span>
                </button>
              </div>
            )}

            {activeTab === 'bot' && (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[300px] custom-scrollbar pr-1">
                  {botMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-2.5 rounded-2xl text-[11px] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-amber-500 text-slate-950 font-bold rounded-tl-sm'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendBotMessage} className="flex gap-1.5 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={botInput}
                    onChange={(e) => setBotInput(e.target.value)}
                    placeholder="اكتب سؤالك للشات بوت..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500">مركز النجاح للتدريب والاستشارات - دعم 24/7</span>
          </div>

        </div>
      )}

      {/* Floating 3D Transparent Pulsing Gold Button */}
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-xl animate-ping pointer-events-none"></div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 w-14 h-14 rounded-2xl bg-transparent hover:bg-amber-500/25 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-amber-400/80 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group backdrop-blur-md animate-pulse"
          title="دردشة سريعة وخدمات الدعم الذكي"
        >
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 backdrop-blur-md flex items-center justify-center text-amber-300 group-hover:text-white transition-colors">
            <MessageCircle className="w-7 h-7 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </div>
          {/* Notification Badge */}
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border border-amber-200 animate-bounce">
            AI
          </span>
        </button>
      </div>
    </div>
  );
};
