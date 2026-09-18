import React, { useState } from 'react';
import { X, Printer, CheckCircle, BookOpen, FileText } from 'lucide-react';
import { AssignmentTask } from '../../types';

interface PrintAssignmentModalProps {
  assignment: AssignmentTask;
  centerName?: string;
  onClose: () => void;
}

export const PrintAssignmentModal: React.FC<PrintAssignmentModalProps> = ({
  assignment,
  centerName = 'مركز النجاح للتدريب والاستشارات',
  onClose
}) => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);

  const questions = assignment.quizGame?.questions || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden" dir="rtl">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800">معاينة وطباعة ورقة التقييم والواجب (PDF / ورقي)</h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span>إرفاق نموذج الإجابة للمعلم 🔑</span>
            </label>

            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند الآن 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white print:p-0 print:overflow-visible">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">{centerName}</h2>
              <div className="text-xs text-slate-600">منظومة التقييمات الأسبوعية والشهرية المعتمدة</div>
              <div className="text-xs font-bold text-indigo-700">المادة: {assignment.courseName || 'المنهج الدراسي'}</div>
            </div>

            <div className="text-left space-y-1">
              <div className="text-sm font-black text-slate-900">{assignment.title}</div>
              <div className="text-xs text-slate-600">الدرجة الكلية: <strong>{assignment.totalMarks || 100} درجة</strong></div>
              <div className="text-[11px] text-slate-500">التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          {/* Student Fill-in Bar */}
          <div className="grid grid-cols-3 gap-4 border border-slate-300 rounded-xl p-3 mb-6 text-xs bg-slate-50 print:bg-transparent">
            <div>اسم المتدرب / الطالب: .......................................</div>
            <div>كود الطالب: .......................................</div>
            <div>المجموعة التدريبية: {assignment.groupName || '................'}</div>
          </div>

          {/* Instructions */}
          {assignment.description && (
            <div className="mb-6 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>تعليمات التقييم:</strong> {assignment.description}
            </div>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد أسئلة تفاعلية مرفقة مع هذا الواجب.
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-2.5 pb-4 border-b border-slate-200 last:border-0">
                  <div className="flex items-start gap-2 text-sm font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`text-xs p-2 rounded-lg border flex items-center gap-2 ${
                          includeAnswerKey && optIdx === q.correctIndex 
                            ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' 
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          {includeAnswerKey && optIdx === q.correctIndex ? '✓' : ['أ', 'ب', 'ج', 'د'][optIdx] || optIdx + 1}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Teacher Answer Key Note */}
                  {includeAnswerKey && q.explanation && (
                    <div className="pr-8 pt-1 text-[11px] text-indigo-700 font-medium">
                      💡 <strong>نموذج الإجابة والتفسير:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between text-[11px] text-slate-500">
            <span>مركز النجاح - جميع الحقوق محفوظة</span>
            <span>توقيع المعلم / المدرب: .......................................</span>
          </div>

        </div>

      </div>
    </div>
  );
};
