import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Send, Mic, Play, Pause, Loader2, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { audioService } from '../services/audioService';

interface AIExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentContext: {
    studentName: string;
    courseName: string;
    gradeLevel?: string;
  };
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AIExplainModal: React.FC<AIExplainModalProps> = ({
  isOpen,
  onClose,
  studentContext,
  showToast
}) => {
  const [inputText, setInputText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const fallbackUtteranceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setExplanation(null);
      setImageBase64(null);
      setInputText('');
      setAudioUrl(null);
      setIsPlaying(false);
      setIsFallback(false);
      audioService.stopAll();
    }
    return () => {
      audioService.stopAll();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      showToast('لم نتمكن من الوصول للكاميرا', 'error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setImageBase64(base64);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTTS = async (text: string) => {
    try {
      // First try calling our backend TTS (which uses gemini-3.1-flash-tts-preview if available)
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audio) {
          // Decode base64 to binary blob URL
          const binary = atob(data.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setIsFallback(false);
          setAudioUrl(url);
        } else {
          setupSpeechFallback();
        }
      } else {
        setupSpeechFallback();
      }
    } catch (e) {
      console.error("TTS generation failed", e);
      setupSpeechFallback();
    }
  };

  const setupSpeechFallback = () => {
    setIsFallback(true);
    setAudioUrl('fallback');
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && !imageBase64) {
      showToast('الرجاء كتابة سؤال أو إرفاق صورة', 'warning');
      return;
    }
    
    setIsProcessing(true);
    setExplanation(null);
    setAudioUrl(null);
    if (audioRef.current) audioRef.current.pause();

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput: inputText,
          imageBase64,
          studentContext
        })
      });
      const data = await res.json();
      if (data.success) {
        setExplanation(data.explanation);
        if (data.audioBase64) {
          setAudioUrl(`data:audio/mp3;base64,${data.audioBase64}`);
        } else {
          // Fallback to generate it client side to proxy if not returned
          generateTTS(data.explanation);
        }
      } else {
        showToast('حدث خطأ أثناء الشرح', 'error');
      }
    } catch (err) {
      showToast('تعذر الاتصال بالخادم', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md pt-safe-top">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h2 className="font-bold text-lg">فهمني واشرحلي</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Intro */}
        {!explanation && !isProcessing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold text-indigo-900 text-lg mb-2">أهلاً بك يا {studentContext.studentName}!</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              أنا المعلم المساعد الذكي الخاص بك. يمكنك تصوير أي جزء من الكتاب، أو كتابة سؤالك وسأقوم بشرحه لك بطريقة سهلة ومبسطة.
            </p>
          </div>
        )}

        {/* Input Section */}
        {!explanation && !isProcessing && (
          <div className="space-y-4">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-indigo-500 shadow-xl"></button>
                  <button onClick={stopCamera} className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : imageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200">
                <img src={imageBase64} alt="Captured" className="w-full object-contain bg-slate-900 max-h-64" />
                <button 
                  onClick={() => setImageBase64(null)} 
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={startCamera}
                  className="bg-indigo-50 border-2 border-dashed border-indigo-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Camera className="w-8 h-8" />
                  <span className="font-bold text-sm">تصوير بالكاميرا</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-sky-50 border-2 border-dashed border-sky-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 text-sky-600 hover:bg-sky-100 transition-colors"
                >
                  <Upload className="w-8 h-8" />
                  <span className="font-bold text-sm">رفع صورة</span>
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-end gap-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <textarea 
                placeholder="أو اكتب سؤالك هنا..."
                className="flex-1 min-h-[60px] max-h-32 p-3 bg-transparent resize-none outline-none text-slate-800"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                onClick={handleSubmit}
                disabled={!inputText.trim() && !imageBase64}
                className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-slate-400 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white rounded-full p-4 shadow-xl">
                <span className="text-4xl">👨‍🏫</span>
              </div>
            </div>
            <h3 className="font-bold text-xl text-indigo-900 mb-2">المعلم يجهز الشرح...</h3>
            <p className="text-slate-500 animate-pulse">لحظات ونقدم لك أفضل شرح!</p>
          </div>
        )}

        {/* Result State */}
        {explanation && !isProcessing && (
          <div className="bg-white rounded-3xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-indigo-900">الشرح المبسط</h3>
              </div>
              
              {explanation && (
                <button 
                  onClick={async () => {
                    if (isPlaying) {
                      audioService.stopAll();
                      setIsPlaying(false);
                    } else {
                      setIsPlaying(true);
                      await audioService.speakText(explanation || '');
                      setIsPlaying(false);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${isPlaying ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-200'}`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'إيقاف' : 'استمع للشرح'}
                </button>
              )}
            </div>
            
            <div className="p-6 prose prose-indigo max-w-none text-slate-800 leading-loose text-lg whitespace-pre-wrap" dir="rtl">
              {explanation}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
              <button 
                onClick={() => {
                  setExplanation(null);
                  setInputText('');
                  setImageBase64(null);
                  setAudioUrl(null);
                }}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                سؤال جديد
              </button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)} 
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}
    </div>
  );
};
