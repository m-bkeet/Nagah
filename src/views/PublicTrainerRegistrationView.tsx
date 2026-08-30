import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Mail, Send, CheckCircle2, Sparkles, Building, ArrowRight, Activity, Percent } from 'lucide-react';
import { api } from '../services/api';
import { Branch } from '../types';

interface PublicTrainerRegistrationViewProps {
  onBack?: () => void;
}

export const PublicTrainerRegistrationView: React.FC<PublicTrainerRegistrationViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branchId: '',
    specialty: '',
    percentage: 50,
    notes: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.getBranches();
      setBranches(res);
      if (res.length > 0) {
        setFormData(prev => ({ ...prev, branchId: res[0].id }));
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.phone || !formData.branchId || !formData.specialty) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/public/register-trainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التسجيل');
      
      if (data.trainer) {
        
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-100 mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-slate-400 mb-8">
            أهلاً بك أ. {formData.name} في فريق المدربين لمركز النجاح للتدريب. سيتم مراجعة طلبك والتواصل معك قريباً.
          </p>
          
          <button
            onClick={onBack}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 px-4 rounded-xl transition-all"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 text-amber-400 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">انضم كمدرب معتمد</h1>
          <p className="text-slate-400">مركز النجاح للتدريب والاستشارات</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-slate-300 font-bold mb-2">الاسم الرباعي *</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 placeholder-slate-500 transition-colors"
                  placeholder="الاسم الرباعي للمدرب"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 font-bold mb-2">رقم الجوال (واتساب) *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 placeholder-slate-500 transition-colors text-left"
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 placeholder-slate-500 transition-colors text-left"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-2">التخصص ومجال التدريب *</label>
              <div className="relative">
                <Briefcase className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 placeholder-slate-500 transition-colors"
                  placeholder="مثال: مدرب حاسب آلي، برمجة، لغات..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 font-bold mb-2">الفرع المفضل *</label>
                <div className="relative">
                  <Building className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 transition-colors appearance-none"
                  >
                    <option value="" disabled>اختر الفرع...</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">النسبة المتوقعة للتدريب (%)</label>
                <div className="relative">
                  <Percent className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: Number(e.target.value)})}
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-slate-100 placeholder-slate-500 transition-colors text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-300 font-bold mb-2">ملاحظات إضافية (أوقات التفرغ)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 rounded-xl p-4 text-slate-100 placeholder-slate-500 transition-colors min-h-[100px]"
                placeholder="أضف أي ملاحظات أو أوقات تفرغ تفضلها..."
              ></textarea>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-4 px-6 rounded-xl shadow-lg transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>تقديم طلب الانضمام كمدرب</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 justify-center mx-auto text-sm transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للمركز
          </button>
        </div>
      </div>
    </div>
  );
};
