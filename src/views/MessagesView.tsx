import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  Users,
  Smartphone,
  CheckCircle,
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  Inbox,
  User,
  Heart,
  Clock,
  Reply,
  Check,
  CheckCheck,
  RefreshCw,
  Globe,
  ChevronRight,
  ArrowRight,
  SmartphoneNfc
} from 'lucide-react';
import { Trainee, Group } from '../types';

export const MessagesView: React.FC = () => {
  const { activeBranchId, showToast, refreshKey } = useCenter();
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'send'>('inbox');
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Send Composer State
  const [selectedTarget, setSelectedTarget] = useState<'all' | 'group' | 'single'>('single');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');
  const [channel, setChannel] = useState<'whatsapp' | 'portal' | 'sms'>('whatsapp');
  const [messageText, setMessageText] = useState('');

  // Inbox & Portal Messages State
  const [portalMessages, setPortalMessages] = useState<any[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'parent' | 'student'>('all');
  const [inboxSearch, setInboxSearch] = useState('');

  // WhatsApp-style active chat state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [sendWaToo, setSendWaToo] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const templates = [
    {
      title: 'ترحيب بالمتدرب الجديد 🌹',
      text: 'أهلاً بك يا {name} في مركز النجاح للتدريب والاستشارات 🌟. يسعدنا انضمامك معنا في {course}، كود المتدرب الخاص بك هو: {code}. بالتوفيق والنجاح الدائم!'
    },
    {
      title: 'إشعار سداد مالي 🧾',
      text: 'عزيزي ولي أمر المتدرب {name}، تم استلام دفعة مالية بنجاح وتسجيل سند القبض في حسابك بمركز النجاح. شاكرين التزامكم.'
    },
    {
      title: 'تنبيه غياب متدرب ⚠️',
      text: 'عزيزي ولي أمر المتدرب {name}، نود إحاطتكم بتسجيل غياب الطالب عن محاضرة اليوم في مجموعة {group}. يرجى التواصل مع الإدارة للتنسيق وتعويض المحتوى.'
    },
    {
      title: 'جاهزية الشهادة 🎓',
      text: 'مبارك يا {name}! 🎉 شهادتك المعتمدة لاجتياز {course} جاهزة للاستلام الآن من مقر مركز النجاح. يمكنك أيضاً تحميل نسختك الرقمية بكود التحقق: {code}.'
    }
  ];

  useEffect(() => {
    loadData();
    loadInboxMessages();

    const interval = setInterval(() => {
      loadInboxMessagesSilently();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBranchId, refreshKey]);

  const loadInboxMessagesSilently = async () => {
    try {
      const res = await fetch('/api/messages/all-portal');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPortalMessages(data);
          }
        }
      }
    } catch (e) {
      // silent retry
    }
  };

  useEffect(() => {
    // Scroll active chat to bottom whenever chat changes or messages load
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, portalMessages]);

  const loadData = async () => {
    try {
      const [tRes, gRes] = await Promise.all([
        api.getTrainees(),
        api.getGroups()
      ]);
      const validT = Array.isArray(tRes) ? tRes : [];
      const validG = Array.isArray(gRes) ? gRes : [];
      const filteredT = activeBranchId !== 'all' ? validT.filter(t => t.branchId === activeBranchId) : validT;
      const filteredG = activeBranchId !== 'all' ? validG.filter(g => g.branchId === activeBranchId) : validG;
      setTrainees(filteredT);
      setGroups(filteredG);
      if (filteredT.length > 0) setSelectedTraineeId(filteredT[0].id);
      if (filteredG.length > 0) setSelectedGroupId(filteredG[0].id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadInboxMessages = async () => {
    setIsLoadingInbox(true);
    try {
      const res = await fetch('/api/messages/all-portal');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setPortalMessages(Array.isArray(data) ? data : []);
        } else {
          setPortalMessages([]);
        }
      } else {
        setPortalMessages([]);
      }
    } catch (err) {
      console.error('Failed to load portal messages', err);
      setPortalMessages([]);
    } finally {
      setIsLoadingInbox(false);
    }
  };

  const applyTemplate = (t: string) => {
    setMessageText(t);
    showToast('تم إدراج القالب في نص الرسالة', 'info');
  };

  const applyTemplateToChat = (text: string) => {
    if (!activeChatId) return;
    const activeChat = chatGroups.find(c => c.traineeId === activeChatId);
    if (!activeChat) return;

    const personalized = text
      .replace('{name}', activeChat.traineeName)
      .replace('{code}', activeChat.traineeCode)
      .replace('{course}', activeChat.courseName || 'الدورة')
      .replace('{group}', activeChat.groupName || 'المجموعة');

    setChatInput(personalized);
    showToast('تم إدراج القالب وتعبئة بيانات الطالب! ✨', 'info');
  };

  const handleSend = async () => {
    if (!messageText.trim()) {
      showToast('يرجى كتابة نص الرسالة أولاً', 'warning');
      return;
    }

    if (selectedTarget === 'single') {
      const targetTrainee = trainees.find(t => t.id === selectedTraineeId);
      if (!targetTrainee) return;

      const finalMsg = messageText
        .replace('{name}', targetTrainee.fullName)
        .replace('{code}', targetTrainee.code)
        .replace('{course}', targetTrainee.courseName || 'الدورة التدريبية')
        .replace('{group}', targetTrainee.groupName || 'المجموعة');

      if (channel === 'whatsapp') {
        const cleanPhone = targetTrainee.phone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(finalMsg)}`, '_blank');
        showToast(`تم فتح المحادثة المباشرة مع (${targetTrainee.fullName})`, 'success');
      } else if (channel === 'portal') {
        try {
          await fetch('/api/messages/send-portal-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              traineeId: targetTrainee.id,
              recipientType: 'student',
              message: finalMsg,
              senderName: 'إدارة مركز النجاح للتدريب'
            })
          });
          showToast(`تم تسليم الرسالة بنجاح إلى بوابة الطالب ولي الأمر (${targetTrainee.fullName})`, 'success');
          setMessageText('');
          loadInboxMessages();
        } catch (err) {
          showToast('حدث خطأ في إرسال الرسالة إلى البوابة', 'error');
        }
      } else {
        showToast(`تم إرسال رسالة SMS إلى (${targetTrainee.fullName}) بنجاح`, 'success');
      }
    } else {
      const targetList = selectedTarget === 'group'
        ? trainees.filter(t => t.groupId === selectedGroupId)
        : trainees;

      if (channel === 'portal') {
        for (const t of targetList) {
          const finalMsg = messageText
            .replace('{name}', t.fullName)
            .replace('{code}', t.code)
            .replace('{course}', t.courseName || 'الدورة')
            .replace('{group}', t.groupName || 'المجموعة');

          await fetch('/api/messages/send-portal-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              traineeId: t.id,
              recipientType: 'student',
              message: finalMsg,
              senderName: 'إدارة مركز النجاح للتدريب'
            })
          });
        }
        showToast(`تم إرسال الإشعارات بنجاح إلى بوابات (${targetList.length}) متدرب!`, 'success');
        setMessageText('');
        loadInboxMessages();
      } else {
        showToast(`تم إرسال الرسائل الجماعية لـ (${targetList.length}) متدرب بنجاح!`, 'success');
      }
    }
  };

  const handleSelectChat = async (traineeId: string) => {
    setActiveChatId(traineeId);
    try {
      await fetch('/api/messages/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId })
      });
      loadInboxMessages();
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;

    setIsSendingChat(true);
    const activeChat = chatGroups.find(c => c.traineeId === activeChatId);
    if (!activeChat) return;

    try {
      const finalMsg = chatInput;
      const targetTrainee = trainees.find(t => t.id === activeChatId);

      const res = await fetch('/api/messages/send-portal-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: activeChatId,
          recipientType: activeChat.messages[0]?.portalSource === 'parent' ? 'parent' : 'student',
          message: finalMsg,
          messageType: 'reply',
          senderName: 'إدارة مركز النجاح للتدريب'
        })
      });

      if (res.ok) {
        showToast('تم إرسال الرد وتحديث البوابة بنجاح! 📬', 'success');
        setChatInput('');
        loadInboxMessages();

        if (sendWaToo && targetTrainee) {
          const cleanPhone = targetTrainee.phone.replace(/[^0-9]/g, '');
          const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone;
          const waMsg = `أهلاً بك السيد ولي الأمر / ${activeChat.parentName} 🌸\nرداً على رسالتكم بمركز النجاح للتدريب:\n"${finalMsg}"`;
          window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }
      } else {
        showToast('فشل في إرسال الرد عبر البوابة', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Group messages WhatsApp-style by student/trainee
  const chatGroups = useMemo(() => {
    const groupsMap: { [key: string]: any } = {};

    portalMessages.forEach(msg => {
      const targetT = trainees.find(t => t.id === msg.traineeId || (t.code && t.code === msg.traineeCode));
      const keyId = targetT?.id || msg.traineeId || msg.traineeCode || 'general-' + (msg.traineeName || 'student');

      if (!keyId) return;

      if (!groupsMap[keyId]) {
        groupsMap[keyId] = {
          traineeId: keyId,
          traineeName: targetT?.fullName || msg.traineeName || 'متدرب',
          traineeCode: targetT?.code || msg.traineeCode || '',
          parentName: targetT?.parentName || msg.parentName || 'ولي الأمر',
          phone: targetT?.phone || '',
          groupName: targetT?.groupName || '',
          courseName: targetT?.courseName || '',
          avatarColor: targetT?.status === 'active' ? 'bg-amber-500' : 'bg-slate-600',
          messages: [],
          unreadCount: 0,
          lastMessageTime: new Date(0)
        };
      }

      groupsMap[keyId].messages.push(msg);

      // Increment unread count if message is not from admin and not read yet
      if (msg.senderRole !== 'admin' && !msg.read) {
        groupsMap[keyId].unreadCount += 1;
      }

      const msgTime = new Date(msg.createdAt);
      if (msgTime > groupsMap[keyId].lastMessageTime) {
        groupsMap[keyId].lastMessageTime = msgTime;
      }
    });

    // Convert map to array, sort messages inside chronologically, and filter group threads
    return Object.values(groupsMap)
      .map((g: any) => {
        g.messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return g;
      })
      .filter((g: any) => {
        // Inbox Filter
        if (inboxFilter === 'parent') {
          const hasParent = g.messages.some((m: any) => m.portalSource === 'parent' || m.recipientType === 'parent');
          if (!hasParent) return false;
        } else if (inboxFilter === 'student') {
          const hasStudent = g.messages.some((m: any) => m.portalSource === 'student' || m.recipientType === 'student');
          if (!hasStudent) return false;
        } else if (inboxFilter === 'unread') {
          if (g.unreadCount === 0) return false;
        }

        // Search Filter
        if (inboxSearch) {
          const q = inboxSearch.toLowerCase();
          const tName = (g.traineeName || '').toLowerCase();
          const pName = (g.parentName || '').toLowerCase();
          const tCode = (g.traineeCode || '').toLowerCase();
          const matchesMsg = g.messages.some((m: any) => (m.message || '').toLowerCase().includes(q));

          if (!tName.includes(q) && !pName.includes(q) && !tCode.includes(q) && !matchesMsg) {
            return false;
          }
        }

        return true;
      })
      .sort((a: any, b: any) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }, [portalMessages, trainees, inboxFilter, inboxSearch]);

  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return chatGroups.find(g => g.traineeId === activeChatId) || null;
  }, [chatGroups, activeChatId]);

  return (
    <div className="space-y-5">
      {/* Header & Tabs */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>مركز الرسائل والتواصل المباشر والواتساب</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            متابعة استفسارات ورسائل أولياء الأمور والطلاب وإرسال التنبيهات المباشرة عبر البوابة والواتساب
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'inbox'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>الوارد الذكي (نظام المحادثات الواتسابي) 📱</span>
            {portalMessages.some(m => !m.read && m.senderRole !== 'admin') && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                جديد
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('send')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'send'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>إرسال إشعارات جماعية جديدة 📣</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: WHATSAPP-STYLE INTERACTIVE CHATS */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-800/40 p-2 rounded-3xl border border-slate-700/60 h-[680px] overflow-hidden">
          
          {/* Right Column: Contacts Sidebar */}
          <div className={`md:col-span-1 bg-slate-900/90 rounded-2xl flex flex-col h-full overflow-hidden border border-slate-700/50 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Search and Filters Header */}
            <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300">محادثات الطلاب وأولياء الأمور</span>
                <button
                  onClick={loadInboxMessages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  title="تحديث الرسائل"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInbox ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  placeholder="بحث باسم الطالب أو محتوى الرسالة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Sub-Filters */}
              <div className="flex gap-1 pt-1">
                <button
                  onClick={() => setInboxFilter('all')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    inboxFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setInboxFilter('parent')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    inboxFilter === 'parent'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  أولياء الأمور
                </button>
                <button
                  onClick={() => setInboxFilter('student')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    inboxFilter === 'student'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الطلاب
                </button>
              </div>
            </div>

            {/* Chat list items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1 bg-slate-950/20">
              {chatGroups.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Inbox className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">لا توجد محادثات تطابق الفلترة حالياً.</p>
                </div>
              ) : (
                chatGroups.map((group) => {
                  const lastMsg = group.messages[group.messages.length - 1];
                  const isLastMsgAdmin = lastMsg?.senderRole === 'admin';
                  const isLastMsgGreeting = lastMsg?.messageType === 'greeting';

                  return (
                    <button
                      key={group.traineeId}
                      onClick={() => handleSelectChat(group.traineeId)}
                      className={`w-full flex items-start gap-2.5 p-3 rounded-xl transition-all text-right ${
                        activeChatId === group.traineeId
                          ? 'bg-slate-800 border-r-4 border-amber-500'
                          : 'hover:bg-slate-800/40 bg-transparent'
                      }`}
                    >
                      {/* Avatar Initials */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-slate-950 ${group.avatarColor || 'bg-amber-400'}`}>
                          {group.traineeName.substring(0, 2)}
                        </div>
                        {group.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-bounce border border-slate-900 shadow">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Contact Details & Last Msg snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-bold text-xs text-slate-200 truncate max-w-[130px]">
                            {group.parentName || group.traineeName}
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-400/80 mt-0.5 truncate font-semibold">
                          طالب: {group.traineeName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1 font-sans">
                          {isLastMsgAdmin ? (
                            <span className="text-emerald-400 flex items-center gap-0.5 shrink-0">
                              <CheckCheck className="w-3 h-3" />
                              <span>أنت:</span>
                            </span>
                          ) : isLastMsgGreeting ? (
                            <span className="text-pink-400 shrink-0">🌹 تحية شكر:</span>
                          ) : null}
                          <span className="truncate">{lastMsg?.message || 'لا توجد رسائل'}</span>
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Left Column: Conversation Workspace Panel */}
          <div className={`md:col-span-2 bg-slate-900/40 rounded-2xl flex flex-col h-full overflow-hidden border border-slate-700/50 ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
              <div className="flex flex-col h-full overflow-hidden bg-slate-950/20">
                
                {/* Active Chat Header */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2.5">
                    {/* Back Button for Mobile View */}
                    <button
                      onClick={() => setActiveChatId(null)}
                      className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="رجوع للمحادثات"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                      {activeChat.traineeName.substring(0, 2)}
                    </div>
                    
                    <div>
                      <h4 className="font-black text-xs text-slate-100 flex items-center gap-1.5">
                        <span>{activeChat.parentName}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">ولي أمر</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        الولد: <strong className="text-amber-300">{activeChat.traineeName}</strong> ({activeChat.traineeCode})
                      </p>
                    </div>
                  </div>

                  {/* Top Header Controls */}
                  <div className="flex items-center gap-1.5">
                    {activeChat.phone && (
                      <button
                        onClick={() => {
                          const cleanPhone = activeChat.phone.replace(/[^0-9]/g, '');
                          const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone;
                          window.open(`https://wa.me/${fullPhone}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-bold border border-emerald-500/20 transition-all"
                        title="فتح دردشة الواتساب المباشرة برقم الهاتف"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>محادثة الهاتف</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Body Area (Scroll Container) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/30">
                  {activeChat.messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const isGreeting = msg.messageType === 'greeting';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        {/* Message Bubble Container */}
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-md space-y-1 relative border transition-all ${
                            isAdmin
                              ? 'bg-amber-500/10 border-amber-500/20 text-slate-100 rounded-tr-none'
                              : isGreeting
                              ? 'bg-pink-950/20 border-pink-500/30 text-slate-100 rounded-tl-none'
                              : 'bg-slate-800/95 border-slate-700 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          {/* Sender Identity */}
                          <div className="flex items-center justify-between gap-4 border-b border-slate-700/20 pb-1 text-[9px] text-slate-400 font-semibold">
                            <span>
                              {isAdmin
                                ? `الإدارة: ${msg.senderName || 'المركز العام'}`
                                : isGreeting
                                ? '🌹 بطاقة شكر وتحية'
                                : `وارد البوابة: ${msg.portalSource === 'parent' ? 'ولي الأمر' : 'الطالب'}`}
                            </span>
                            <span className="font-mono">
                              {new Date(msg.createdAt).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Message Text */}
                          <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                            {msg.message}
                          </p>

                          {/* Double Checks status indicator */}
                          {isAdmin && (
                            <div className="flex items-center justify-end text-[9px] text-slate-400 pt-0.5 gap-0.5 font-mono">
                              {msg.read ? (
                                <span className="text-cyan-400 flex items-center gap-0.5 font-bold">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  <span>تمت قراءتها بالبوابة</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>مستلمة بالبوابة</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Reply personalizer Drop-up */}
                <div className="p-2 border-t border-slate-850 bg-slate-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">قوالب سريعة:</span>
                    {templates.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyTemplateToChat(tpl.text)}
                        className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-700 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-bold shrink-0 transition-all flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>{tpl.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Inline Message Compose Bar */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <div className="flex-1 relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-amber-500">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`الرد المباشر بطلب أو رد توضيحي للسيد / ${activeChat.parentName}...`}
                        className="w-full bg-transparent border-none text-slate-100 text-xs focus:outline-none placeholder:text-slate-500"
                        disabled={isSendingChat}
                      />
                      
                      {/* WhatsApp toggle option */}
                      <label className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-lg text-[9px] font-black text-slate-400 hover:text-white cursor-pointer transition-all border border-slate-800 select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={sendWaToo}
                          onChange={(e) => setSendWaToo(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-transparent w-3 h-3 cursor-pointer"
                        />
                        <span className="text-emerald-400">إرسال واتساب أيضاً</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingChat || !chatInput.trim()}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1"
                    >
                      {isSendingChat ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>إرسال</span>
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-slate-950/10">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                  <MessageSquare className="w-10 h-10 text-amber-400" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-black text-sm text-slate-200">بوابة محادثات ولي الأمر والطالب 💬</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    انقر على أي اسم من القائمة الجانبية لبدء استعراض الرسائل السابقة، الرد الفوري المباشر عبر البوابة، أو نسخها وإرسالها واتساب وتتبع حالتها!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Subtab 2: SEND COMPOSER */}
      {activeSubTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Message Composer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
              {/* Target & Channel Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الجهة المستهدفة:</label>
                  <select
                    value={selectedTarget}
                    onChange={(e: any) => setSelectedTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="single">متدرب محدد (رسالة فردية مباشرة)</option>
                    <option value="group">مجموعة تدريبية كاملة</option>
                    <option value="all">جميع متدربي المركز النشطين</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">قناة الإرسال والتسليم:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border transition-all ${
                        channel === 'whatsapp'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('portal')}
                      className={`py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border transition-all ${
                        channel === 'portal'
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>البوابة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border transition-all ${
                        channel === 'sms'
                          ? 'bg-blue-600 border-blue-500 text-white shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* If Single Trainee */}
              {selectedTarget === 'single' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-xs">اختر المتدرب:</label>
                  <select
                    value={selectedTraineeId}
                    onChange={(e) => setSelectedTraineeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {trainees.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} (ولي الأمر: السيد / {t.parentName || 'غير مسجل'}) - {t.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* If Group */}
              {selectedTarget === 'group' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-xs">اختر المجموعة:</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.roomName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold text-xs">نص الرسالة:</label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    المتغيرات المتاحة: {'{name}'} , {'{code}'} , {'{course}'}
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="اكتب نص الرسالة هنا أو اختر قالباً جاهزاً من القائمة الجانبية..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة الآن</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Ready Templates */}
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                قوالب ونماذج الرسائل الجاهزة
              </h3>
              <p className="text-[11px] text-slate-400">انقر على أي نموذج لنسخه فوراً في صندوق الرسالة</p>

              <div className="space-y-2.5">
                {templates.map((tpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyTemplate(tpl.text)}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition-all space-y-1 group"
                  >
                    <h4 className="font-bold text-xs text-slate-200 group-hover:text-amber-300">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
