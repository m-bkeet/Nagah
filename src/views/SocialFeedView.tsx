import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { MessageSquare, Heart, Send, Users, Image as ImageIcon, Video, User, Camera, Play, Mic, StopCircle } from 'lucide-react';
import { SocialPost, UserProfile } from '../types';
import { FileUpload } from '../components/FileUpload';
import { uploadFile } from '../lib/storage';

export const SocialFeedView: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'reels'>('feed');
  const [activePostComments, setActivePostComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    fullName: '',
    bio: '',
    avatarUrl: '',
    coverUrl: ''
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  useEffect(() => {
    fetchPosts();
    if (user) {
      const initialProfile = {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000',
        bio: 'عضو في أكاديمية النجاح'
      };
      setProfile(initialProfile);
      setEditProfileForm({
        fullName: initialProfile.fullName,
        bio: initialProfile.bio,
        avatarUrl: initialProfile.avatarUrl,
        coverUrl: initialProfile.coverUrl
      });
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const fetchedPosts = await fetch('/api/social/posts').then(res => res.json());
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video', target: 'avatar' | 'cover' | 'post') => {
    try {
      const path = `uploads/${user?.id}/${target}_${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      if (target === 'avatar') {
        setEditProfileForm(prev => ({...prev, avatarUrl: url}));
        alert('تم رفع الصورة الشخصية بنجاح');
      } else if (target === 'cover') {
        setEditProfileForm(prev => ({...prev, coverUrl: url}));
        alert('تم رفع صورة الغلاف بنجاح');
      } else {
        setMediaUrl(url);
        setMediaType(type);
        alert('تم رفع الملف بنجاح، يمكنك الآن نشر المنشور');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('تعذر رفع الملف، يرجى المحاولة مرة أخرى');
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('عذراً، متصفحك لا يدعم خاصية تسجيل الشاشة (اللايف). يرجى استخدام متصفح حديث مثل Chrome أو Edge.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunks.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          const file = new File([blob], `lecture_${Date.now()}.webm`, { type: 'video/webm' });
          const url = await uploadFile(file, `lectures/${user?.id}/${Date.now()}.webm`);
          
          // Auto-post the lecture
          await fetch('/api/social/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  authorId: user?.id,
                  authorName: user?.fullName,
                  authorRole: user?.role,
                  content: 'محاضرة لايف جديدة 🎥',
                  mediaUrl: url,
                  mediaType: 'video'
              })
          });
          fetchPosts();
          alert('تم نشر المحاضرة اللايف بنجاح!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting live:', err);
      alert('تعذر بدء اللايف. قد يكون بسبب رفض الصلاحيات أو عدم دعم المتصفح.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const fetchComments = async (postId: string) => {
    try {
      const fetchedComments = await fetch(`/api/social/posts/${postId}/comments`).then(res => res.json());
      setComments(prev => ({ ...prev, [postId]: fetchedComments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleUpdateProfile = () => {
    setProfile(prev => prev ? { ...prev, ...editProfileForm } : null);
    setIsEditingProfile(false);
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !mediaUrl) || !user) return;
    try {
      await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.fullName,
          authorRole: user.role,
          authorAvatar: profile?.avatarUrl,
          content: newPostContent,
          mediaUrl,
          mediaType
        })
      });
      setNewPostContent('');
      setMediaUrl('');
      setMediaType(undefined);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim() || !user) return;
    try {
      await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.fullName,
          content: newCommentText
        })
      });
      setNewCommentText('');
      fetchComments(postId);
      // Refresh posts to update comment count
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      fetchPosts();
    } catch (error) {
        console.error('Error liking post:', error);
    }
  };

  const reels = posts.filter(p => p.mediaType === 'video');

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-blue-600/20 to-indigo-600/20 border border-amber-500/30 rounded-3xl p-6 text-center shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
          <span>🌟</span>
          <span>مجتمع النجاح للتدريب والاستشارات</span>
          <span>🌟</span>
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl mx-auto">
          مجتمع تفاعلي ذكي يجمع الطلاب والمعلمين معاً لمشاركة المنشورات، طرح الأسئلة، ونقاشات الدورات التدريبية لزيادة التفاعل التعليمي والمهني.
        </p>
      </div>

      {/* Profile Header (Facebook Style) */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="h-48 w-full relative bg-gradient-to-r from-slate-800 to-slate-700">
          {profile?.coverUrl && <img src={profile.coverUrl} className="w-full h-full object-cover opacity-60" alt="Cover" />}
          <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white backdrop-blur-sm transition-all">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 -mt-16">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-amber-500">
                    {user?.fullName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <button className="absolute bottom-1 right-1 bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-white border border-slate-700 shadow-lg transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center md:text-right pt-4 flex-1">
              <h1 className="text-3xl font-black text-white">{user?.fullName}</h1>
              <p className="text-slate-400 mt-1">{profile?.bio}</p>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl font-bold transition-all"
                >
                  تعديل الملف
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">تعديل الملف الشخصي</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={editProfileForm.fullName}
                  onChange={(e) => setEditProfileForm({...editProfileForm, fullName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">النبذة الشخصية (Bio)</label>
                <textarea 
                  value={editProfileForm.bio}
                  onChange={(e) => setEditProfileForm({...editProfileForm, bio: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الصورة الشخصية</label>
                  <FileUpload onFileUploaded={(file) => handleFileUpload(file, 'image', 'avatar')} type="image" label="تغيير الصورة" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">صورة الغلاف</label>
                  <FileUpload onFileUploaded={(file) => handleFileUpload(file, 'image', 'cover')} type="image" label="تغيير الغلاف" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleUpdateProfile}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold transition-all"
              >
                حفظ التغييرات
              </button>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'feed' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            آخر الأخبار
          </button>
          <button 
            onClick={() => setActiveTab('reels')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'reels' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            <Play className="w-4 h-4" />
            ريلز (Reels)
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <>
          {/* Create Post Area */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-amber-500 shrink-0">
                {user?.fullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1 space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`ما الذي يدور في ذهنك يا ${user?.fullName}؟`}
                  className="w-full bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none resize-none text-lg"
                  rows={3}
                />
                
                {/* Media Preview before posting */}
                {mediaUrl && (
                  <div className="relative mt-4 mb-2 rounded-xl overflow-hidden border border-slate-700 inline-block bg-slate-900">
                    {mediaType === 'image' ? (
                      <img src={mediaUrl} alt="Preview" className="h-32 w-auto object-cover" />
                    ) : (
                      <video src={mediaUrl} className="h-32 w-auto object-cover" />
                    )}
                    <button 
                      onClick={() => {setMediaUrl(''); setMediaType(undefined);}}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full text-xs shadow-md"
                      title="إزالة"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <FileUpload onFileUploaded={(file) => handleFileUpload(file, 'image', 'post')} type="image" label="صورة" />
                    <FileUpload onFileUploaded={(file) => handleFileUpload(file, 'video', 'post')} type="video" label="فيديو" />
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-red-400 hover:bg-red-500/10'}`}
                    >
                        <Mic className="w-5 h-5" />
                        <span>{isRecording ? 'إيقاف اللايف' : 'بدء لايف'}</span>
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                  >
                    <span>نشر المنشور</span>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {isLoading ? (
                <div className="text-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold">جاري تحميل المنشورات...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">لا توجد منشورات حتى الآن. كن أول من يشارك!</p>
                </div>
            ) : (
                posts.map((post) => (
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-amber-500 font-black text-xl shadow-lg">
                            {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full rounded-full object-cover" /> : post.authorName?.charAt(0) || '?'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-black text-white text-lg">{post.authorName}</p>
                                <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {post.authorRole === 'trainer' ? 'مدرب' : post.authorRole === 'general_manager' ? 'مدير' : 'طالب'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-bold">{new Date(post.createdAt).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <p className="text-slate-100 text-lg leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden mb-6 bg-black/20 border border-slate-800">
                            {post.mediaType === 'image' ? (
                                <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[600px] object-contain" />
                            ) : (
                                <video src={post.mediaUrl} controls className="w-full h-auto max-h-[600px]" />
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${post.likes.includes(user?.id || '') ? 'bg-amber-500 text-white font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Heart className={`w-5 h-5 ${post.likes.includes(user?.id || '') ? 'fill-current' : ''}`} />
                            <span>{post.likes.length}</span>
                        </button>
                        <button 
                            onClick={() => {
                                if (activePostComments === post.id) {
                                    setActivePostComments(null);
                                } else {
                                    setActivePostComments(post.id);
                                    fetchComments(post.id);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-all font-bold"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>{post.commentsCount} تعليق</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {activePostComments === post.id && (
                        <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-500 shrink-0">
                                    {user?.fullName?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="اكتب تعليقاً..."
                                        className="flex-1 bg-slate-950 text-slate-100 p-2 px-4 rounded-xl border border-slate-800 focus:border-amber-500 outline-none text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                    />
                                    <button 
                                        onClick={() => handleAddComment(post.id)}
                                        className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {comments[post.id]?.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                            {comment.authorName.charAt(0)}
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-2xl flex-1">
                                            <p className="font-bold text-white text-xs mb-1">{comment.authorName}</p>
                                            <p className="text-slate-300 text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
                ))
            )}
          </div>
        </>
      ) : (
        /* Enhanced Reels View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20">
            {reels.length === 0 ? (
                <div className="col-span-full text-center p-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                    <Play className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-xl">لا توجد مقاطع ريلز حالياً</p>
                </div>
            ) : (
                reels.map(reel => (
                    <motion.div 
                        key={reel.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative aspect-[9/16] bg-black rounded-3xl overflow-hidden group shadow-2xl border border-slate-800"
                    >
                        <video 
                          src={reel.mediaUrl} 
                          className="w-full h-full object-cover" 
                          loop 
                          muted 
                          playsInline 
                          onMouseOver={e => (e.target as HTMLVideoElement).play()} 
                          onMouseOut={e => (e.target as HTMLVideoElement).pause()} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-black font-black">
                                    {reel.authorAvatar ? <img src={reel.authorAvatar} className="w-full h-full rounded-full object-cover" /> : reel.authorName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white font-black text-sm">{reel.authorName}</p>
                                  <p className="text-amber-500 text-[10px] font-bold">@{reel.authorId.substring(0, 8)}</p>
                                </div>
                            </div>
                            <p className="text-slate-100 text-sm line-clamp-2 mb-4 leading-relaxed">{reel.content}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-white bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="text-xs font-black">{reel.likes.length}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-white bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs font-black">{reel.commentsCount}</span>
                              </div>
                            </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-amber-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-amber-600/20">Reel</div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:hidden transition-all">
                            <div className="bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/20">
                              <Play className="w-8 h-8 text-white fill-current" />
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
      )}
    </div>
  );
};
