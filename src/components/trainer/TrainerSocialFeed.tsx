import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Send,
  Heart,
  Award,
  Vote,
  Sparkles,
  Camera,
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
  Smile,
  RefreshCw,
  Share2,
  Users
} from 'lucide-react';
import { Trainer, StudentPost } from '../../types';

interface TrainerSocialFeedProps {
  trainer: Trainer;
  onUpdateTrainerPhoto: (newPhotoUrl: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainerSocialFeed: React.FC<TrainerSocialFeedProps> = ({
  trainer,
  onUpdateTrainerPhoto,
  onShowToast
}) => {
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Post Creator State
  const [postType, setPostType] = useState<'trainer_announcement' | 'poll' | 'challenge'>('trainer_announcement');
  const [postContent, setPostContent] = useState('');
  const [bgStyle, setBgStyle] = useState('default');

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>(['نعم، بكل تأكيد', 'أحتاج مراجعة إضافية']);

  // Challenge state
  const [challengeTask, setChallengeTask] = useState('');
  const [challengePoints, setChallengePoints] = useState(50);

  const [isPublishing, setIsPublishing] = useState(false);

  // Photo Upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [trainer.id]);

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/public/student-posts');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.warn('Failed to load posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const b64 = evt.target?.result as string;
      setIsUploadingPhoto(true);
      try {
        const res = await fetch('/api/trainer-portal/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainerId: trainer.id,
            photoUrl: b64
          })
        });
        const data = await res.json();
        if (data.success) {
          onUpdateTrainerPhoto(b64);
          onShowToast('تم تحديث وحفظ صورة المدرب بنجاح! 📸', 'success');
        } else {
          onShowToast(data.error || 'فشل تحديث الصورة', 'error');
        }
      } catch (err: any) {
        onShowToast('تعذر حفظ الصورة بالخادم', 'error');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishPost = async () => {
    if (!postContent.trim()) {
      onShowToast('يرجى كتابة نص المنشور أو السؤال', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/trainer-portal/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: trainer.id,
          trainerName: trainer.name,
          trainerPhotoUrl: trainer.photoUrl,
          content: postContent.trim(),
          bgStyle,
          type: postType,
          pollOptions: postType === 'poll' ? pollOptions.filter(o => o.trim()) : undefined,
          challengePoints: postType === 'challenge' ? challengePoints : undefined,
          challengeTask: postType === 'challenge' ? challengeTask : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setPostContent('');
        setChallengeTask('');
        onShowToast('تم نشر التحديث والتفاعل للطلاب بنجاح! 🎉', 'success');
      } else {
        onShowToast(data.error || 'فشل النشر', 'error');
      }
    } catch (err: any) {
      onShowToast('تعذر الاتصال بالخادم', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    try {
      const res = await fetch('/api/trainer-portal/poll-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          optionIndex,
          userId: trainer.id
        })
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
        onShowToast('تم تسجيل تصويتك بنجاح!', 'success');
      }
    } catch (err) {
      onShowToast('فشل تسجيل التصويت', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header & Avatar Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-2xl border-2 border-amber-400/40 shadow-lg">
              {trainer.photoUrl ? (
                <img src={trainer.photoUrl} alt={trainer.name} className="w-full h-full object-cover" />
              ) : (
                trainer.name?.charAt(0) || 'م'
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md transition-all active:scale-95"
              title="تغيير الصورة الشخصية"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              {trainer.name}
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                مدرب معتمد 🎓
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              كود المدرب: {trainer.code || '---'} • {trainer.phone || ''}
            </p>
          </div>
        </div>

        <button
          onClick={loadPosts}
          disabled={isLoadingPosts}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin' : ''}`} />
          <span>تحديث التفاعلات</span>
        </button>
      </div>

      {/* Post Creator Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
        {/* Post Type Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setPostType('trainer_announcement')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              postType === 'trainer_announcement' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>إعلان وتوجيه تعليمي 📢</span>
          </button>

          <button
            onClick={() => setPostType('poll')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              postType === 'poll' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>استطلاع رأي تفاعلي 📊</span>
          </button>

          <button
            onClick={() => setPostType('challenge')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              postType === 'challenge' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>تحدي ومسابقة بالمعمل 🏆</span>
          </button>
        </div>

        {/* Text Input */}
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder={
            postType === 'poll'
              ? 'اكتب سؤال الاستطلاع... (مثال: ما رأيكم في مستوى تطبيق بايثون اليوم؟)'
              : postType === 'challenge'
              ? 'اكتب عنوان التحدي البرمجي... (مثال: تحدي كتابة برنامج حاسبة في 15 دقيقة)'
              : 'اكتب نصيحة، توجيه للطلاب، أو إعلاناً هاماً عن المحاضرة القادمة...'
          }
          rows={3}
          className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
        />

        {/* Poll Options Fields */}
        {postType === 'poll' && (
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-bold text-amber-400">خيارات الاستطلاع:</div>
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[idx] = e.target.value;
                    setPollOptions(next);
                  }}
                  placeholder={`الخيار ${idx + 1}`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                onClick={() => setPollOptions(prev => [...prev, ''])}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خيار آخر</span>
              </button>
            )}
          </div>
        )}

        {/* Challenge Fields */}
        {postType === 'challenge' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">مهمة التحدي المطلوبة</label>
              <input
                type="text"
                value={challengeTask}
                onChange={(e) => setChallengeTask(e.target.value)}
                placeholder="مثال: إنشاء رسم متحرك في سكراتش يتفاعل مع لوحة المفاتيح"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">نقاط المكافأة للفائزين ⭐</label>
              <input
                type="number"
                value={challengePoints}
                onChange={(e) => setChallengePoints(Number(e.target.value))}
                min={10}
                max={500}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handlePublishPost}
            disabled={isPublishing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>نشر التفاعل فوراً للطلاب</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          تفاعلات ومنشورات المجتمع الطلابي بالمركز ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            لا توجد منشورات حتى الآن. كن أول من يبادر بنشر نصيحة أو استطلاع رأي للطلاب!
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-sm">
                    {post.traineePhotoUrl ? (
                      <img src={post.traineePhotoUrl} alt={post.traineeName} className="w-full h-full object-cover" />
                    ) : (
                      post.traineeName?.charAt(0) || 'ط'
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      {post.traineeName}
                      {(post.isTrainerPost || post.traineeId === trainer.id) && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                          المدرب
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.createdAt).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {post.type === 'challenge' && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    تحدي نشط
                  </span>
                )}
              </div>

              {/* Post Content */}
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Poll UI */}
              {post.poll && post.poll.options && (
                <div className="space-y-2 pt-2">
                  {post.poll.options.map((opt: any, optIdx: number) => {
                    const totalVotes = post.poll.options.reduce((acc: number, o: any) => acc + (o.votes?.length || 0), 0);
                    const optVotes = opt.votes?.length || 0;
                    const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                    const hasVoted = opt.votes?.includes(trainer.id);

                    return (
                      <button
                        key={opt.id || optIdx}
                        onClick={() => handleVotePoll(post.id, optIdx)}
                        className={`w-full text-right p-3 rounded-2xl border transition-all relative overflow-hidden ${
                          hasVoted
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="absolute top-0 bottom-0 right-0 bg-amber-500/10 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                          <span>{opt.text}</span>
                          <span className="font-mono text-slate-400">{percent}% ({optVotes})</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Challenge Box */}
              {post.challenge && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-red-400">مهمة التحدي:</div>
                    <div className="text-xs text-slate-200 mt-0.5">{post.challenge.task || post.challenge.title}</div>
                  </div>
                  <div className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 shrink-0">
                    +{post.challenge.rewardPoints || 50} نقطة ⭐
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
