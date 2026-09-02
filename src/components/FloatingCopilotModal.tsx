import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, BrainCircuit, RefreshCw } from 'lucide-react';

interface FloatingCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingCopilotModal: React.FC<FloatingCopilotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'أهلاً بك يا بطل! أنا المساعد الذكي لمعمل النجاح 🤖، كيف يمكنني مساعدتك في الشرح، إدارة الطلاب، أو تجهيز أسئلة الاختبار اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    // Mock AI response logic (To be replaced with actual Gemini API if required later)
    setTimeout(() => {
      let aiReply = 'أنا هنا لمساعدتك! كوني مساعداً ذكياً تجريبياً في هذه اللحظة، أقترح عليك مكافأة الطلاب المتفاعلين الآن باستخدام "أداة النقاط" في شريط الأدوات، أو اختيار طالب عشوائي بعجلة الحظ لزيادة التركيز.';
      
      if (userMessage.includes('سؤال') || userMessage.includes('اختبار')) {
         aiReply = 'إليك سؤال تفاعلي لطلابك: "ما هو الجزء المسؤول عن معالجة البيانات في الحاسوب ولماذا يعتبر العقل المدبر للجهاز؟" 🧠 شاركه معهم الآن!';
      } else if (userMessage.includes('ازعاج') || userMessage.includes('صوت')) {
         aiReply = 'للتعامل مع الإزعاج، يمكنك استخدام "أداة التنبيه الصوتي 📢" من شريط الأدوات العائم، أو استخدام وضع "عزل الضوضاء" للتركيز.';
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      setLoading(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={onClose} dir="rtl">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full h-[75vh] flex flex-col overflow-hidden animate-fadeIn" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 font-bold relative overflow-hidden group">
              <Bot className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-fuchsia-400/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 flex items-center gap-1.5">
                مساعد التدريب الذكي (AI)
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-400">رفيقك الذكي في إدارة الحصة وتوليد الأسئلة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-fuchsia-600 text-white rounded-tl-sm' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tr-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-fuchsia-400 animate-spin" />
                <span className="text-xs text-slate-400">جاري التفكير المبدع...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/50 flex items-center gap-2 overflow-x-auto hide-scrollbar bg-slate-900/50">
           <button onClick={() => setInput('اقترح سؤال تفاعلي سريع للطلاب')} className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 transition-all flex items-center gap-1">
             <BrainCircuit className="w-3 h-3 text-emerald-400" /> اقتراح سؤال سريع
           </button>
           <button onClick={() => setInput('كيف أتعامل مع تشتت الانتباه الآن؟')} className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 transition-all flex items-center gap-1">
             <Target className="w-3 h-3 text-rose-400" /> التعامل مع التشتت
           </button>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="اسألني أي شيء يخص إدارتك للحصة..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pr-4 pl-12 text-xs text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute left-2 w-8 h-8 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 -mr-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
