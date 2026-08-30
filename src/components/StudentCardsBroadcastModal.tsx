import React, { useState } from 'react';
import { X, Printer, Send, MessageCircle, Award, Users, CheckCircle } from 'lucide-react';
import { Trainee, Course, Group, Branch } from '../types';

interface StudentCardsBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  courses: Course[];
  groups: Group[];
  branches: Branch[];
  initialSelectedTrainee?: Trainee | null;
  initialGroupId?: string;
  initialCourseId?: string;
  initialBranchId?: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData: () => void;
}

export const StudentCardsBroadcastModal: React.FC<StudentCardsBroadcastModalProps> = ({
  isOpen,
  onClose,
  trainees,
  courses,
  groups,
  branches,
  initialSelectedTrainee,
  initialGroupId,
  initialCourseId,
  initialBranchId,
  onShowToast,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'broadcast'>('cards');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || 'all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || 'all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || 'all');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('مرحباً بك في مركز النجاح. نود تذكيرك بموعد حصتك القادمة ومتابعة مهامك التدريبية.');
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>(
    initialSelectedTrainee ? [initialSelectedTrainee.id] : []
  );

  if (!isOpen) return null;

  const filteredTrainees = trainees.filter(t => {
    if (selectedBranchId !== 'all' && t.branchId !== selectedBranchId) return false;
    if (selectedCourseId !== 'all' && t.courseId !== selectedCourseId && !(t.courseIds && t.courseIds.includes(selectedCourseId))) return false;
    if (selectedGroupId !== 'all' && t.groupId !== selectedGroupId) return false;
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedTraineeIds.length === filteredTrainees.length) {
      setSelectedTraineeIds([]);
    } else {
      setSelectedTraineeIds(filteredTrainees.map(t => t.id));
    }
  };

  const handleToggleTrainee = (id: string) => {
    if (selectedTraineeIds.includes(id)) {
      setSelectedTraineeIds(selectedTraineeIds.filter(i => i !== id));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, id]);
    }
  };

  const handlePrintCards = () => {
    const listToPrint = filteredTrainees.length > 0 ? filteredTrainees : trainees;
    if (listToPrint.length === 0) {
      onShowToast('لا يوجد متدربين للطباعة', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowToast('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
      return;
    }

    const cardsHtml = listToPrint.map(t => {
      const branchObj = branches.find(b => b.id === t.branchId);
      const courseObj = courses.find(c => c.id === t.courseId || (t.courseIds && t.courseIds.includes(c.id)));
      const groupObj = groups.find(g => g.id === t.groupId);

      return `
        <div class="trainee-card">
          <div class="card-header">
            <div class="center-title">مركز النجاح للتدريب</div>
            <div class="card-type">بطاقة متدرب رسمي</div>
          </div>
          <div class="card-body">
            <div class="avatar">${t.fullName.charAt(0)}</div>
            <div class="info">
              <div class="name">${t.fullName}</div>
              <div class="code">كود المتدرب: <strong>${t.code || 'N/A'}</strong></div>
              <div class="detail">الفرع: ${branchObj ? branchObj.name : 'الفرع الرئيسي'}</div>
              <div class="detail">الدورة: ${courseObj ? courseObj.name : 'الدورة التدريبية'}</div>
              ${groupObj ? `<div class="detail">المجموعة: ${groupObj.name}</div>` : ''}
            </div>
          </div>
          <div class="card-footer">
            <div class="barcode">||| | |||| || | || |||</div>
            <div class="validity">معتمدة من الإدارة</div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة بطاقات المتدربين - مركز النجاح</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            background: #fff;
            color: #0f172a;
            margin: 0;
            padding: 20px;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            .grid-container { grid-template-columns: repeat(2, 1fr); gap: 15px; page-break-inside: avoid; }
          }
          .trainee-card {
            border: 2px solid #3b82f6;
            border-radius: 16px;
            overflow: hidden;
            background: #f8fafc;
            width: 100%;
            max-width: 380px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            margin: 0 auto;
          }
          .card-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .center-title { font-size: 13px; font-weight: 700; }
          .card-type { font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 6px; }
          .card-body { padding: 15px; display: flex; gap: 15px; align-items: center; }
          .avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #dbeafe;
            color: #1e40af;
            font-size: 24px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 2px solid #3b82f6;
          }
          .info { flex: 1; }
          .name { font-size: 16px; font-weight: 900; color: #1e293b; margin-bottom: 4px; }
          .code { font-size: 12px; color: #2563eb; margin-bottom: 6px; font-family: monospace; }
          .detail { font-size: 11px; color: #475569; margin-bottom: 2px; }
          .card-footer {
            background: #f1f5f9;
            padding: 8px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #64748b;
          }
          .barcode { font-family: monospace; letter-spacing: 2px; font-size: 12px; font-weight: bold; }
          .print-actions { text-align: center; margin-bottom: 30px; }
          .btn-print {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          }
        </style>
      </head>
      <body>
        <div class="print-actions no-print">
          <button class="btn-print" onclick="window.print()">طباعة البطاقات الآن 🖨️</button>
        </div>
        <div class="grid-container">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 400);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    onShowToast(`تم تجهيز ${listToPrint.length} بطاقة للطباعة بنجاح! 🖨️`, 'success');
  };

  const handleSendBroadcast = () => {
    if (selectedTraineeIds.length === 0) {
      onShowToast('يرجى اختيار متدرب واحد على الأقل للإرسال', 'error');
      return;
    }
    const selectedList = trainees.filter(t => selectedTraineeIds.includes(t.id));
    let sentCount = 0;

    selectedList.forEach((t, idx) => {
      const phone = t.phone || t.parentPhone;
      if (phone) {
        // Clean phone number
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const personalizedMsg = `مرحباً بالمتدرب/ة ${t.fullName} (كود: ${t.code || 'N/A'}):\n\n${broadcastMessage}\n\nمع تحيات مركز النجاح للتدريب 🌟`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMsg)}`;
        
        // Open WhatsApp for each trainee with a slight stagger to prevent browser popup block
        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, idx * 300);
        sentCount++;
      }
    });

    if (sentCount === 0) {
      onShowToast('لا يوجد أرقام هواتف صالحة للمتدربين المختارين', 'error');
    } else {
      onShowToast(`تم فتح نافذة واتساب لـ ${sentCount} متدرب بنجاح! 📱`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">إدارة بطاقات المتدربين وإرسال الرسائل</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">طباعة الهويات والبطاقات وإرسال الإشعارات عبر واتساب</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>طباعة بطاقات المتدربين</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'broadcast'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال واتساب جماعي وفردي</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفرع</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="all">جميع الفروع</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الدورة</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="all">جميع الدورات</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المجموعة</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="all">جميع المجموعات</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'cards' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  عدد المتدربين المحددين للطباعة: {filteredTrainees.length}
                </span>
                <button
                  onClick={handlePrintCards}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة البطاقات الآن</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrainees.map(t => (
                  <div key={t.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-lg">
                        {t.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{t.fullName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">الكود: {t.code} | الهاتف: {t.phone || 'غير متوفر'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                      نشط
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نص الرسالة</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب نص الرسالة هنا..."
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedTraineeIds.length === filteredTrainees.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'} ({selectedTraineeIds.length})
                </button>
                <button
                  onClick={handleSendBroadcast}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال عبر واتساب</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                {filteredTrainees.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTrainee(t.id)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                      selectedTraineeIds.includes(t.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTraineeIds.includes(t.id)}
                        onChange={() => {}}
                        className="rounded text-blue-600"
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white">{t.fullName}</p>
                        <p className="text-xs text-slate-500">{t.phone || 'بدون هاتف'}</p>
                      </div>
                    </div>
                    {selectedTraineeIds.includes(t.id) && (
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-sm rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
