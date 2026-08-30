import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear potentially corrupt local state
      localStorage.removeItem('nagah_theme_id');
      localStorage.removeItem('nagah_is_lab_device');
      localStorage.removeItem('nagah_device_id');
      localStorage.removeItem('success_v7_user');
      localStorage.removeItem('success_v7_token');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = window.location.origin;
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0c0f1f] via-[#121026] to-[#080a14] text-slate-100 font-sans"
          dir="rtl"
        >
          <div className="max-w-lg w-full bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/50 backdrop-blur-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            {/* Titles */}
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-white">
                {this.props.fallbackTitle || 'استعادة واستقرار النظام 🛡️'}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                تم رصد استثناء غير متوقع في واجهة العرض وتم احتواؤه تلقائياً لمنع توقف النظام. يمكنك استئناف العمل فوراً عبر الخيارات التالية:
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                title="مسح الذاكرة المؤقتة التالفة وتسجيل الدخول من جديد"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح الذاكرة</span>
              </button>
            </div>

            {/* Error Technical Details Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>التفاصيل الفنية للاستثناء</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left font-mono text-[10px] text-rose-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all" dir="ltr">
                  <div className="font-bold text-amber-400 mb-1">{this.state.error?.toString()}</div>
                  <div className="text-slate-400">{this.state.errorInfo?.componentStack}</div>
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
