'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProgressStore } from '@/store/useProgressStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { formatTime } from '@/lib/utils';
import {
  Trophy, Award, CheckCircle2, Clock, Play, 
  Sparkles, Moon, Radio, Flame, ArrowRight,
  BookOpen, Bookmark, User, Check, RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { progressMap, fetchProgress, toggleComplete } = useProgressStore();
  const { playEpisode } = usePlayerStore();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchProgress(user.id);

      // جلب عدد الملاحظات المكتوبة
      supabase
        .from('user_notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => {
          if (count !== null) setNotesCount(count);
        });
    }
  }, [user?.id, fetchProgress]);

  useEffect(() => {
    async function loadEpisodes() {
      const { data } = await supabase
        .from('episodes')
        .select('*')
        .order('season', { ascending: true })
        .order('episode_number', { ascending: true });

      if (data) setEpisodes(data);
      setLoadingEpisodes(false);
    }
    loadEpisodes();
  }, []);

  // الحسابات والإحصائيات
  const totalEpisodesCount = episodes.length || 161;

  const completedEpisodes = useMemo(() => {
    return episodes.filter((ep) => progressMap[ep.id]?.is_completed);
  }, [episodes, progressMap]);

  const completedCount = completedEpisodes.length;
  const overallPercentage = Math.round((completedCount / totalEpisodesCount) * 100) || 0;

  // إجمالي ساعات الاستماع (المكتملة + الثواني المستمع إليها)
  const totalListenedSeconds = useMemo(() => {
    let secs = 0;
    episodes.forEach((ep) => {
      const prog = progressMap[ep.id];
      if (prog?.is_completed) {
        secs += ep.duration_seconds || 3600;
      } else if (prog?.last_position_seconds) {
        secs += prog.last_position_seconds;
      }
    });
    return secs;
  }, [episodes, progressMap]);

  const totalHours = Math.floor(totalListenedSeconds / 3600);
  const totalMinutes = Math.floor((totalListenedSeconds % 3600) / 60);

  // إحصائيات البرنامجين
  const ehMoshklaEpisodes = episodes.filter((ep) => ep.program !== 'ala-el-maghreb');
  const ehMoshklaCompleted = ehMoshklaEpisodes.filter((ep) => progressMap[ep.id]?.is_completed).length;
  const ehMoshklaPercentage = Math.round((ehMoshklaCompleted / (ehMoshklaEpisodes.length || 1)) * 100);

  const maghrebEpisodes = episodes.filter((ep) => ep.program === 'ala-el-maghreb');
  const maghrebCompleted = maghrebEpisodes.filter((ep) => progressMap[ep.id]?.is_completed).length;
  const maghrebPercentage = Math.round((maghrebCompleted / (maghrebEpisodes.length || 1)) * 100);

  // آخر حلقة قيد الاستماع (Continue Listening)
  const continueEpisode = useMemo(() => {
    const inProgressList = episodes
      .filter((ep) => {
        const p = progressMap[ep.id];
        return p && !p.is_completed && p.last_position_seconds > 60;
      })
      .sort((a, b) => {
        const timeA = new Date(progressMap[a.id]?.updated_at || 0).getTime();
        const timeB = new Date(progressMap[b.id]?.updated_at || 0).getTime();
        return timeB - timeA;
      });

    return inProgressList[0] || null;
  }, [episodes, progressMap]);

  // نظام الشارات والأوسمة
  const badges = [
    {
      id: 'first-step',
      title: 'بداية المسير',
      description: 'أكملت أول حلقة لك على المنصة',
      icon: '🌱',
      isUnlocked: completedCount >= 1,
      progress: Math.min(100, Math.round((completedCount / 1) * 100)),
    },
    {
      id: 'consistent',
      title: 'شغف المعرفة',
      description: 'أكملت 5 حلقات بنجاح',
      icon: '🔥',
      isUnlocked: completedCount >= 5,
      progress: Math.min(100, Math.round((completedCount / 5) * 100)),
    },
    {
      id: 'maghreb-lover',
      title: 'أنيس المغرب',
      description: 'أكملت 10 حلقات من برنامج عالـمغرب',
      icon: '🌙',
      isUnlocked: maghrebCompleted >= 10,
      progress: Math.min(100, Math.round((maghrebCompleted / 10) * 100)),
    },
    {
      id: 'notetaker',
      title: 'المستمع المدوّن',
      description: 'دوّنت 5 فوائد وملاحظات في مساحتك',
      icon: '✍️',
      isUnlocked: notesCount >= 5,
      progress: Math.min(100, Math.round((notesCount / 5) * 100)),
    },
    {
      id: 'season-master',
      title: 'عابر المواسم',
      description: 'أنجزت أكثر من 25 حلقة في رحلتك',
      icon: '⭐',
      isUnlocked: completedCount >= 25,
      progress: Math.min(100, Math.round((completedCount / 25) * 100)),
    },
    {
      id: 'podcast-expert',
      title: 'خبير إيه المشكلة',
      description: 'أتممت 50 حلقة من محتوى المنصة',
      icon: '🏆',
      isUnlocked: completedCount >= 50,
      progress: Math.min(100, Math.round((completedCount / 50) * 100)),
    },
  ];

  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <User className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-bold">يرجى تسجيل الدخول لعرض حسابك ومتابعة تقدمك</h2>
          <p className="text-xs text-zinc-400 max-w-sm">
            سجل دخولك بحساب Google لمزامنة استماعك وتدوين الفوائد وحساب ساعات التعلّم تلقائياً.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-2xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-8 flex flex-col gap-8">
        
        {/* بطاقة المستخدم الشخصية */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <div className="h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-zinc-700 bg-zinc-800 shadow-xl flex-shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-500">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.user_metadata?.full_name || 'مستمع متميز'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  حساب نشط
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{user?.email}</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                الرحلة مستمرة نحو الاستماع الواعي والتزكية ✨
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notes"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-800"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>ملاحظاتي ({notesCount})</span>
            </Link>
          </div>
        </div>

        {/* كروت الإحصائيات الرئيسية */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold">الحلقات المكتملة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{completedCount}</span>
              <span className="text-xs text-zinc-500">/ {totalEpisodesCount}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold">وقت الاستماع الكلي</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalHours}</span>
              <span className="text-xs text-zinc-400">ساعة</span>
              <span className="text-lg font-bold text-zinc-300 font-mono mr-1">{totalMinutes}</span>
              <span className="text-xs text-zinc-400">د</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">استماع نافع وتدوين</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold">نسبة إنجاز المنصة</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{overallPercentage}%</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">من إجمالي 161 حلقة</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold">الأوسمة المكتسبة</span>
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {badges.filter((b) => b.isUnlocked).length}
              </span>
              <span className="text-xs text-zinc-500">/ {badges.length}</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">شارات التميز</span>
          </div>
        </div>

        {/* قسم «تابع من حيث توقفت» */}
        {continueEpisode && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 relative group">
                <img
                  src={continueEpisode.thumbnail_url}
                  alt={continueEpisode.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> تابع من حيث توقفت
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-md mt-0.5">
                  {continueEpisode.title}
                </h3>
                <span className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  توقفت عند {formatTime(progressMap[continueEpisode.id]?.last_position_seconds || 0)} من أصل {formatTime(continueEpisode.duration_seconds)}
                </span>
              </div>
            </div>

            <button
              onClick={() => playEpisode(continueEpisode, 'video')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-black transition-transform active:scale-95 shadow-md flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>متابعة التشغيل الآن</span>
            </button>
          </div>
        )}

        {/* التقدم حسب السلسلة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-300" />
                <h4 className="text-sm font-bold text-white">إيه المشكلة؟ (المواسم 1-6)</h4>
              </div>
              <span className="text-xs font-bold text-zinc-400 font-mono">
                {ehMoshklaCompleted} / {ehMoshklaEpisodes.length} ({ehMoshklaPercentage}%)
              </span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800/60">
              <div
                className="bg-slate-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${ehMoshklaPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">عالـمغرب (رمضان 1-3)</h4>
              </div>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {maghrebCompleted} / {maghrebEpisodes.length} ({maghrebPercentage}%)
              </span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800/60">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${maghrebPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* قسم الأوسمة والشارات */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">أوسمة وشارات الإنجاز</h3>
            </div>
            <span className="text-xs text-zinc-500">تُفتح تلقائياً بمواصلة الاستماع</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.isUnlocked
                    ? 'bg-zinc-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    badge.isUnlocked
                      ? 'bg-amber-400/10 border border-amber-400/20 shadow-inner'
                      : 'bg-zinc-800/50 border border-zinc-700/40 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white">{badge.title}</h5>
                    {badge.isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> تم الإنجاز
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">{badge.progress}%</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الحلقات المكتملة مؤخراً */}
        <div className="flex flex-col gap-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>الحلقات التي أتممتها ({completedCount})</span>
            </h3>
            <Link href="/" className="text-xs text-zinc-400 hover:text-white font-bold flex items-center gap-1">
              <span>تصفح كل الحلقات</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>

          {completedEpisodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {completedEpisodes.slice(0, 10).map((ep) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img src={ep.thumbnail_url} alt={ep.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {ep.program === 'ala-el-maghreb' ? `عالـمغرب ${ep.season}` : `الموسم ${ep.season}`} • حلقة {ep.episode_number}
                      </span>
                      <h5 className="text-xs font-bold text-white truncate max-w-xs">{ep.title}</h5>
                    </div>
                  </div>

                  <button
                    onClick={() => user?.id && toggleComplete(user.id, ep.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-red-500/10 text-emerald-400 hover:text-red-400 transition-colors flex-shrink-0"
                    title="إلغاء وسم الإتمام"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
              لم تقم بإنهاء أي حلقة بعد. اضغط على زر علامة الصح (✓) على أي حلقة لإضافتها لإنجازاتك!
            </div>
          )}
        </div>

      </div>

      <Player />
    </main>
  );
}
