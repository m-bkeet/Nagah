import React, { useState, useEffect } from 'react';
import {
  Video,
  MessageSquare,
  Presentation,
  FileSpreadsheet,
  FileText,
  Users,
  Plus,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  ShieldCheck,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import {
  googleSignIn,
  workspaceLogout,
  initWorkspaceAuth,
  getWorkspaceAccessToken,
  listGoogleForms,
  listGoogleClassroomCourses,
  listGoogleSlides,
  createGoogleMeetSpace,
  listGoogleChatSpaces,
  sendGoogleChatMessage,
  WorkspaceUser
} from '../services/googleWorkspace';

export interface GoogleWorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'meet' | 'chat' | 'slides' | 'forms' | 'classroom';
}

export const GoogleWorkspaceHubModal: React.FC<GoogleWorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'meet'
}) => {
  const { showToast } = useCenter();
  const [activeTab, setActiveTab] = useState<'meet' | 'chat' | 'slides' | 'forms' | 'classroom'>(defaultTab);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Meet state
  const [meetSpace, setMeetSpace] = useState<any>(null);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);

  // Chat state
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedChatSpace, setSelectedChatSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Slides state
  const [slidesList, setSlidesList] = useState<any[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);

  // Forms / Classroom state
  const [formsList, setFormsList] = useState<any[]>([]);
  const [classroomList, setClassroomList] = useState<any[]>([]);
  const [isLoadingEducation, setIsLoadingEducation] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initWorkspaceAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        fetchAllData(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const handleSignIn = async () => {
    setError(null);
    try {
      setIsLoading(true);
      showToast('جارٍ المصادقة مع حساب Google Workspace... ⏳', 'info');
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast('تم الاتصال بحساب Google Workspace بنجاح! 🚀', 'success');
        fetchAllData(res.accessToken);
      }
    } catch (err: any) {
      setError(err?.message || 'فشل الاتصال بحساب Google');
      showToast('فشل المصادقة مع Google Workspace', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await workspaceLogout();
    setUser(null);
    setToken(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const fetchAllData = async (accessToken: string) => {
    setIsLoadingSlides(true);
    setIsLoadingEducation(true);
    try {
      const [slides, forms, courses, spaces] = await Promise.all([
        listGoogleSlides(accessToken).catch(() => []),
        listGoogleForms(accessToken).catch(() => []),
        listGoogleClassroomCourses(accessToken).catch(() => []),
        listGoogleChatSpaces(accessToken).catch(() => [])
      ]);
      setSlidesList(slides);
      setFormsList(forms);
      setClassroomList(courses);
      setChatSpaces(spaces);
      if (spaces.length > 0 && !selectedChatSpace) {
        setSelectedChatSpace(spaces[0].name);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingSlides(false);
      setIsLoadingEducation(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!token) return;
    setIsCreatingMeet(true);
    setError(null);
    try {
      showToast('جارٍ إنشاء غرفة Google Meet جديدة... ⏳', 'info');
      const space = await createGoogleMeetSpace(token);
      setMeetSpace(space);
      showToast('تم إنشاء اجتماع Google Meet بنجاح! 🎥', 'success');
    } catch (err: any) {
      setError(err?.message || 'فشل إنشاء غرفة Meet');
      showToast('فشل إنشاء غرفة Google Meet', 'error');
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedChatSpace || !chatMessageText.trim()) return;
    setIsSendingChat(true);
    setError(null);
    try {
      await sendGoogleChatMessage(token, selectedChatSpace, chatMessageText.trim());
      setChatMessageText('');
      showToast('تم إرسال رسالة Google Chat بنجاح! 💬', 'success');
    } catch (err: any) {
      setError(err?.message || 'فشل إرسال الرسالة');
      showToast('فشل إرسال رسالة Google Chat', 'error');
    } finally {
      setIsSendingChat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-base text-white">مركز خدمات Google Workspace المتكامل</h2>
              <p className="text-[11px] text-slate-400">إدارة الاجتماعات (Meet)، المحادثات (Chat)، العروض (Slides)، والاختبارات (Forms & Classroom)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!user || !token ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LinkIcon className="w-10 h-10 animate-pulse" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-black text-xl text-white">ربط حساب Google Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                يرجى تسجيل الدخول بحساب Google الخاص بك لتفعيل الصلاحيات الكاملة للتعامل مع Google Meet، Google Chat، Google Slides، والمزيد مباشرة من داخل نظام إدارة سنتر النجاح.
              </p>
            </div>
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-blue-600/20 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              <span>تسجيل الدخول بحساب Google 🚀</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-950/40 p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
              <div className="hidden md:flex items-center justify-between px-3 py-2 mb-2 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="truncate">
                  <p className="text-[10px] text-slate-400">المستخدم المتصل</p>
                  <p className="text-xs font-bold text-emerald-400 truncate">{user.email || user.displayName || 'Google User'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  title="تسجيل الخروج"
                  className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setActiveTab('meet')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all text-right ${
                  activeTab === 'meet'
                    ? 'bg-blue-600/20 border border-blue-500 text-blue-300 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Video className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Google Meet (غرف الاجتماعات)</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all text-right ${
                  activeTab === 'chat'
                    ? 'bg-teal-600/20 border border-teal-500 text-teal-300 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Google Chat (المحادثات والرسائل)</span>
              </button>

              <button
                onClick={() => setActiveTab('slides')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all text-right ${
                  activeTab === 'slides'
                    ? 'bg-amber-600/20 border border-amber-500 text-amber-300 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Presentation className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Google Slides (العروض التقديمية)</span>
              </button>

              <button
                onClick={() => setActiveTab('forms')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all text-right ${
                  activeTab === 'forms'
                    ? 'bg-emerald-600/20 border border-emerald-500 text-emerald-300 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google Forms (النماذج والاستبيانات)</span>
              </button>

              <button
                onClick={() => setActiveTab('classroom')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all text-right ${
                  activeTab === 'classroom'
                    ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Google Classroom (الفصول الدراسية)</span>
              </button>
            </div>

            {/* Main Panel View */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* TAB 1: GOOGLE MEET */}
              {activeTab === 'meet' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-black text-base text-white">إنشاء وإدارة اجتماعات Google Meet الحية</h3>
                      <p className="text-xs text-slate-400">قم بإنشاء غرف بث مباشر واجتماعات فورية للمجموعات والطلاب</p>
                    </div>
                    <button
                      onClick={handleCreateMeet}
                      disabled={isCreatingMeet}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isCreatingMeet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>إنشاء غرفة Meet جديدة</span>
                    </button>
                  </div>

                  {meetSpace ? (
                    <div className="p-5 bg-blue-950/30 border border-blue-500/40 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-blue-300 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        <span>تم إنشاء غرفة Google Meet بنجاح!</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">اسم المساحة (Space Name)</span>
                          <span className="font-mono text-slate-200">{meetSpace.name}</span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block mb-1">رابط الاجتماع (Meeting URI)</span>
                          <a
                            href={meetSpace.meetingUri}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-blue-400 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <span>{meetSpace.meetingUri}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
                      <Video className="w-12 h-12 text-blue-500/40 mx-auto" />
                      <p className="text-xs text-slate-400">اضغط على زر "إنشاء غرفة Meet جديدة" أعلاه لبدء اجتماع جديد.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GOOGLE CHAT */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-800">
                    <h3 className="font-black text-base text-white">إرسال الرسائل عبر Google Chat</h3>
                    <p className="text-xs text-slate-400">تواصل مع المجموعات والفرق التعليمية مباشرة عبر مساحات Google Chat</p>
                  </div>

                  <form onSubmit={handleSendChat} className="space-y-4 bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">اختر مساحة الدردشة (Chat Space)</label>
                      <select
                        value={selectedChatSpace}
                        onChange={(e) => setSelectedChatSpace(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      >
                        {chatSpaces.length === 0 ? (
                          <option value="">لا توجد مساحات دردشة متاحة بالحساب</option>
                        ) : (
                          chatSpaces.map((space) => (
                            <option key={space.name} value={space.name}>
                              {space.displayName || space.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">نص الرسالة</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="اكتب رسالتك للمجموعات والطلاب هنا..."
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSendingChat || !selectedChatSpace || !chatMessageText.trim()}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isSendingChat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>إرسال عبر Google Chat</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: GOOGLE SLIDES */}
              {activeTab === 'slides' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-black text-base text-white">العروض التقديمية (Google Slides)</h3>
                      <p className="text-xs text-slate-400">استعراض العروض والشروس التقديمية الخاصة بالدورات التدريبية</p>
                    </div>
                    <button
                      onClick={() => token && fetchAllData(token)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingSlides ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingSlides ? (
                    <div className="text-center py-16 text-slate-400 text-xs">جارٍ تحميل العروض التقديمية... ⏳</div>
                  ) : slidesList.length === 0 ? (
                    <div className="text-center py-16 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                      <Presentation className="w-12 h-12 text-amber-500/40 mx-auto" />
                      <p className="text-xs text-slate-400">لا توجد عروض تقديمية (Google Slides) في حساب Google الخاص بك.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slidesList.map((slide) => (
                        <div key={slide.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                              <Presentation className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-xs text-slate-200 truncate">{slide.name}</h4>
                              <span className="text-[10px] text-slate-500">تم التعديل: {new Date(slide.modifiedTime || Date.now()).toLocaleDateString('ar')}</span>
                            </div>
                          </div>
                          {slide.webViewLink && (
                            <a
                              href={slide.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: GOOGLE FORMS */}
              {activeTab === 'forms' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-black text-base text-white">النماذج والاستبيانات (Google Forms)</h3>
                      <p className="text-xs text-slate-400">نماذج التسجيل والاستبيانات المتاحة بحسابك</p>
                    </div>
                    <button
                      onClick={() => token && fetchAllData(token)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingEducation ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingEducation ? (
                    <div className="text-center py-16 text-slate-400 text-xs">جارٍ تحميل النماذج... ⏳</div>
                  ) : formsList.length === 0 ? (
                    <div className="text-center py-16 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                      <FileText className="w-12 h-12 text-emerald-500/40 mx-auto" />
                      <p className="text-xs text-slate-400">لا توجد نماذج Google Forms في حسابك حالياً.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formsList.map((form) => (
                        <div key={form.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-xs text-slate-200 truncate">{form.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {form.id}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: GOOGLE CLASSROOM */}
              {activeTab === 'classroom' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-black text-base text-white">الفصول الدراسية (Google Classroom)</h3>
                      <p className="text-xs text-slate-400">الفصول والدورات الدراسية المربوطة بحساب المعلم</p>
                    </div>
                    <button
                      onClick={() => token && fetchAllData(token)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingEducation ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingEducation ? (
                    <div className="text-center py-16 text-slate-400 text-xs">جارٍ تحميل الفصول الدراسية... ⏳</div>
                  ) : classroomList.length === 0 ? (
                    <div className="text-center py-16 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                      <Users className="w-12 h-12 text-indigo-500/40 mx-auto" />
                      <p className="text-xs text-slate-400">لا توجد فصول دراسية في Google Classroom.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {classroomList.map((course) => (
                        <div key={course.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-xs text-slate-200 truncate">{course.name}</h4>
                              <span className="text-[10px] text-slate-500">{course.section || 'الفصل الرئيسي'}</span>
                            </div>
                          </div>
                          {course.alternateLink && (
                            <a
                              href={course.alternateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
