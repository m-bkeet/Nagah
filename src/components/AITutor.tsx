import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Image as ImageIcon, Sparkles, Volume2, Camera, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { audioService } from '../services/audioService';

export const AITutor = ({ studentName, studentLevel }: { studentName: string, studentLevel?: string }) => {
  const [question, setQuestion] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioService.stopAll();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const askTutor = async () => {
    if (!question.trim() && !imageBase64) return;
    setIsAsking(true);
    setResponse(null);
    audioService.stopAll();
    setIsPlaying(false);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, imageBase64, studentLevel, studentName })
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.explanation);
      } else {
        alert(data.error || 'حدث خطأ.');
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم.');
    } finally {
      setIsAsking(false);
    }
  };

  const playTTS = async () => {
    if (!response) return;

    if (isPlaying) {
      audioService.stopAll();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const cleanText = response.replace(/[#*`_-]/g, '');
    await audioService.speakText(cleanText);
    setIsPlaying(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            فهمني واشرحلي <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-sm text-slate-400">معلمك الذكي جاهز لمساعدتك في أي وقت</p>
        </div>
      </div>

      <div className="space-y-4">
        {imageBase64 && (
          <div className="relative inline-block">
            <img src={imageBase64} className="h-32 rounded-xl border border-slate-700 object-cover" />
            <button 
              onClick={() => setImageBase64(null)} 
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤالك هنا، أو صور الجزئية اللي مش فاهمها من الكتاب..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white min-h-[120px] focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              title="إرفاق صورة"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <button
          onClick={askTutor}
          disabled={isAsking || (!question.trim() && !imageBase64)}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAsking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التفكير وتحضير الشرح...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              اشرحلي يا مستر
            </>
          )}
        </button>
      </div>

      {response && (
        <div className="mt-8 bg-slate-950/50 border border-indigo-500/30 rounded-2xl p-6 relative">
          <button 
            onClick={playTTS}
            className={`absolute top-4 left-4 p-2.5 rounded-full transition-colors ${isPlaying ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40'}`}
            title={isPlaying ? "إيقاف الصوت" : "استماع للشرح"}
          >
            {isPlaying ? (
              <span className="w-5 h-5 flex items-center justify-center font-bold text-xs">■</span>
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-indigo-400">شرح المستر الذكي:</span>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-loose">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
