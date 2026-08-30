import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { listGoogleForms, getGoogleFormResponses, getGoogleFormInfo, getWorkspaceAccessToken } from '../services/googleWorkspace';

export interface GoogleFormsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (trainees: any[]) => Promise<void>;
}

export const GoogleFormsImportModal: React.FC<GoogleFormsImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const { showToast } = useCenter();
  const [forms, setForms] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchForms();
    }
  }, [isOpen]);

  const fetchForms = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const token = await getWorkspaceAccessToken();
      if (!token) {
        throw new Error('يرجى تسجيل الدخول إلى Google Workspace أولاً من الإعدادات.');
      }
      const fetchedForms = await listGoogleForms(token);
      setForms(fetchedForms);
    } catch (err: any) {
      setError(err?.message || 'فشل جلب نماذج Google Forms');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFormId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getWorkspaceAccessToken();
      if (!token) throw new Error('Token not found');
      
      showToast('جاري تحليل ردود النموذج...', 'info');
      const formInfo = await getGoogleFormInfo(token, selectedFormId);
      const responses = await getGoogleFormResponses(token, selectedFormId);
      
      if (!responses || responses.length === 0) {
        throw new Error('لا توجد ردود في هذا النموذج حتى الآن.');
      }

      // Very basic parser assuming form has some generic items
      const parsedTrainees = responses.map((res: any, index: number) => {
        let name = '';
        let phone = '';
        const answers = res.answers || {};
        
        // try to guess fields
        Object.keys(answers).forEach(qId => {
          const answerText = answers[qId]?.textAnswers?.answers?.[0]?.value || '';
          const questionItem = formInfo.items?.find((item: any) => item.questionItem?.question?.questionId === qId);
          if (questionItem) {
            const title = questionItem.title || '';
            if (title.includes('اسم') || title.toLowerCase().includes('name')) {
              name = answerText;
            } else if (title.includes('رقم') || title.includes('تليفون') || title.includes('هاتف') || title.toLowerCase().includes('phone')) {
              phone = answerText;
            }
          }
        });

        return {
          id: res.responseId || `temp_import_${Date.now()}_${index}`,
          fullName: name || `طالب ${index + 1} (من النموذج)`,
          phone: phone || '',
          whatsapp: phone || '',
          notes: `مستورد من نموذج: ${formInfo.info?.title || 'Google Form'}`,
        };
      });

      await onImport(parsedTrainees);
      showToast(`تم استيراد ${parsedTrainees.length} طالب بنجاح، يمكنك الآن مراجعتهم`, 'success');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل استيراد بيانات النموذج');
      showToast('حدث خطأ أثناء الاستيراد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">استيراد بيانات من Google Forms</h2>
              <p className="text-xs text-slate-400">اختر نموذج تسجيل لاستيراد استجابات الطلاب</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="p-4 mb-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p>جارٍ تحميل النماذج...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>لا توجد نماذج متاحة في حساب Google الخاص بك.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-white mb-2 block">اختر النموذج المطلوب استيراده</label>
                <select 
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- اختر النموذج --</option>
                  {forms.map(form => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80 text-xs leading-relaxed">
                <strong className="block mb-1 text-emerald-400">ملاحظة:</strong>
                سيقوم النظام بمحاولة استخراج (الاسم، رقم الهاتف) تلقائياً من استجابات النموذج. إذا كانت أسئلة النموذج بأسماء مختلفة، قد تحتاج إلى استكمال بعض البيانات يدوياً في شاشة المراجعة التالية.
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-all font-bold text-sm"
          >
            إلغاء
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !selectedFormId}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? 'جاري التحليل...' : 'تحليل واستيراد'}
          </button>
        </div>
      </div>
    </div>
  );
};
