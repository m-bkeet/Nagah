import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { Search, X, Users, GraduationCap, BookOpen, Wallet, Monitor, ArrowLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  onNavigate?: (view: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen } = useCenter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    trainees: any[];
    trainers: any[];
    courses: any[];
    payments: any[];
    devices: any[];
  }>({
    trainees: [],
    trainers: [],
    courses: [],
    payments: [],
    devices: []
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ trainees: [], trainers: [], courses: [], payments: [], devices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const totalResults =
    results.trainees.length +
    results.trainers.length +
    results.courses.length +
    results.payments.length +
    results.devices.length;

  const handleSelect = (view: string, id?: string) => {
    setIsSearchOpen(false);
    setQuery('');
    onNavigate?.(view, id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-4 bg-slate-950/70 backdrop-blur-sm no-print" onClick={() => setIsSearchOpen(false)}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200 mt-1" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            placeholder="ابحث بالاسم، الكود، رقم الهاتف، اسم الدورة، رقم الإيصال..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-100 text-sm placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-8 text-center text-xs text-amber-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>جاري البحث في قاعدة بيانات المركز...</span>
            </div>
          )}

          {!isLoading && query && totalResults === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              لم يتم العثور على أي نتائج مطابقة لـ "{query}"
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-8 text-center text-slate-400 text-xs leading-relaxed">
              اكتب كلمة البحث للوصول السريع إلى أي متدرب، مدرب، دورة تدريبية، إيصال مالي أو جهاز معمل.
            </div>
          )}

          {/* Trainees Section */}
          {results.trainees.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                المتدربون ({results.trainees.length})
              </h4>
              <div className="space-y-1.5">
                {results.trainees.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect('trainees', t.id)}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{t.fullName}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          {t.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        هاتف: {t.phone} | الرسوم المتبقية: {t.remainingAmount} ج.م
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trainers Section */}
          {results.trainers.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                المدربون ({results.trainers.length})
              </h4>
              <div className="space-y-1.5">
                {results.trainers.map((tr) => (
                  <div
                    key={tr.id}
                    onClick={() => handleSelect('trainers', tr.id)}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{tr.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        تخصص: {tr.specialty} | هاتف: {tr.phone}
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Section */}
          {results.courses.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                الدورات التدريبية ({results.courses.length})
              </h4>
              <div className="space-y-1.5">
                {results.courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect('courses', c.id)}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {c.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        رسوم: {c.feeAmount} ج.م | الساعات: {c.hoursCount} ساعة
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Section */}
          {results.payments.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                إيصالات القبض ({results.payments.length})
              </h4>
              <div className="space-y-1.5">
                {results.payments.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect('finance')}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>إيصال رقم: {p.receiptNumber}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {p.amount} ج.م
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        التاريخ: {p.date} | المستلم: {p.receivedByUserName || 'الخزينة'}
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devices Section */}
          {results.devices.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                أجهزة المعمل ({results.devices.length})
              </h4>
              <div className="space-y-1.5">
                {results.devices.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelect('devices', d.id)}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{d.name}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {d.deviceId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        IP: {d.ipAddress} | الحالة: {d.isOnline ? '🟢 متصل' : '🔴 غير متصل'}
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
