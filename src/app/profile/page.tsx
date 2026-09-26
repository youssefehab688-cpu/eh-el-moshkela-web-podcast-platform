'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Episode } from '@/types';
import { 
  User, BookOpen, Bookmark, Headphones, Sparkles, Clock, 
  CheckCircle2, Award, Radio, Moon, ArrowLeft, Trophy
} from 'lucide-react';

function formatHoursMinutes(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} س و ${minutes} د`;
  }
  return `${minutes} دقيقة`;
}

export default function ProfilePage() {
  const { user, openAuthModal, signOut } = useAuthStore();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [lastListened, setLastListened] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshLocalData = () => {
    try {
      const watched = JSON.parse(localStorage.getItem('eh_el_moshkla_watched') || '[]');
      setWatchedIds(Array.isArray(watched) ? watched : []);

      const saved = localStorage.getItem('eh_el_moshkla_last_played');
      if (saved) setLastListened(JSON.parse(saved));
    } catch (e) {}
  };

  useEffect(() => {
    refreshLocalData();

    async function loadData() {
      try {
        const { data: eps } = await supabase
          .from('episodes')
          .select('*')
          .order('season', { ascending: true })
          .order('episode_number', { ascending: true });

        if (eps) setEpisodes(eps);

        if (user) {
          const { count: nC } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          const { count: bC } = await supabase
            .from('bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (nC !== null) setNotesCount(nC);
          if (bC !== null) setBookmarksCount(bC);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    window.addEventListener('app_storage_updated', refreshLocalData);
    return () => window.removeEventListener('app_storage_updated', refreshLocalData);
  }, [user]);

  const stats = useMemo(() => {
    const validWatchedSet = new Set(watchedIds);
    let totalSeconds = 0;
    let completedEpisodesCount = 0;

    episodes.forEach((ep) => {
      if (validWatchedSet.has(ep.id)) {
        completedEpisodesCount++;
        totalSeconds += ep.duration_seconds || 3600;
      }
    });

    const totalEps = episodes.length || 1;
    const progressPercent = Math.min(100, Math.round((completedEpisodesCount / totalEps) * 100));

    return {
      completedEpisodesCount,
      totalEpisodes: episodes.length,
      totalSeconds,
      progressPercent,
    };
  }, [episodes, watchedIds]);

  const seasonProgress = useMemo(() => {
    const validWatchedSet = new Set(watchedIds);

    const calcProgramSeasons = (program: string, seasonsList: number[]) => {
      return seasonsList.map((s) => {
        const seasonEps = episodes.filter((ep) => ep.program === program && Number(ep.season) === s);
        const total = seasonEps.length;
        const watched = seasonEps.filter((ep) => validWatchedSet.has(ep.id)).length;
        const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
        return { season: s, total, watched, pct, isCompleted: total > 0 && watched === total };
      });
    };

    return {
      ehElMoshkla: calcProgramSeasons('eh-el-moshkla', [1, 2, 3, 4, 5, 6]),
      alaElMaghreb: calcProgramSeasons('ala-el-maghreb', [1, 2, 3]),
    };
  }, [episodes, watchedIds]);

  const lastPlayedProgress = useMemo(() => {
    if (!lastListened?.currentTime || !lastListened?.duration) return 0;
    return Math.min(100, Math.round((lastListened.currentTime / lastListened.duration) * 100));
  }, [lastListened]);

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-24 space-y-6">
        {!user ? (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl p-6">
            <User className="w-12 h-12 text-zinc-600" />
            <h2 className="text-xl font-bold text-white">سجّل دخولك لمتابعة إحصائياتك وإنجازاتك</h2>
            <p className="text-xs text-zinc-400 max-w-sm">
              يمكنك ربط حسابك لحفظ فوائدك ومحفوظاتك ومتابعة تقدمك في مواسم البودكاست عبر الأجهزة المختلفة.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-200 transition-all shadow"
            >
              تسجيل الدخول بحساب Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl font-black shadow-lg">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-base font-black text-white">{user.user_metadata?.full_name || 'مستمع المنصة'}</span>
                  <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors border border-zinc-700/60"
              >
                تسجيل الخروج
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-zinc-900/60 border border-amber-500/20 flex flex-col gap-4 text-right shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>رحلتك في الاستماع والتعلم</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  {stats.progressPercent}% مكتمل
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-amber-300 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>أنهيت <strong>{stats.completedEpisodesCount}</strong> من أصل <strong>{stats.totalEpisodes}</strong> حلقة</span>
                <span>إجمالي وقت الاستماع: <strong className="text-white font-mono">{formatHoursMinutes(stats.totalSeconds)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold">الحلقات المكتملة</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono mt-1">{stats.completedEpisodesCount}</span>
                <span className="text-[11px] text-zinc-500 font-mono">من {stats.totalEpisodes} حلقة</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-sky-400">
                  <span className="text-xs font-bold">ساعات الاستماع</span>
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1">{formatHoursMinutes(stats.totalSeconds)}</span>
                <span className="text-[11px] text-zinc-500">وقت تراكمي مُنجز</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold">الفوائد المدونة</span>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono mt-1">{notesCount}</span>
                <span className="text-[11px] text-zinc-500">ملاحظة وخاطرة</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold">المحفوظات</span>
                  <Bookmark className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono mt-1">{bookmarksCount}</span>
                <span className="text-[11px] text-zinc-500">حلقة محفوظة</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-5 text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-black text-white">متابعة إنجاز المواسم</h3>
                </div>
                <span className="text-xs text-zinc-500">تتبع تقدمك في كل موسم</span>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>بودكاست إيه المشكلة؟ (6 مواسم):</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {seasonProgress.ehElMoshkla.map((s) => (
                    <div 
                      key={`eh-${s.season}`}
                      className={`p-3 rounded-2xl border flex flex-col gap-1.5 text-right transition-all ${
                        s.isCompleted
                          ? 'bg-amber-400/15 border-amber-400/40 shadow-sm ring-1 ring-amber-400/30'
                          : 'bg-zinc-950/60 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={s.isCompleted ? 'text-amber-400' : 'text-zinc-300'}>الموسم {s.season}</span>
                        {s.isCompleted && <span className="text-[10px] text-amber-400 font-mono">✓</span>}
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${s.pct}%` }} 
                        />
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono">
                        {s.watched} / {s.total} حلقة
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-zinc-800/60 w-full" />

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  <span>برنامج عالـمغرب (3 مواسم):</span>
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  {seasonProgress.alaElMaghreb.map((s) => (
                    <div 
                      key={`maghreb-${s.season}`}
                      className={`p-3 rounded-2xl border flex flex-col gap-1.5 text-right transition-all ${
                        s.isCompleted
                          ? 'bg-sky-400/15 border-sky-400/40 shadow-sm ring-1 ring-sky-400/30'
                          : 'bg-zinc-950/60 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={s.isCompleted ? 'text-sky-400' : 'text-zinc-300'}>الموسم {s.season}</span>
                        {s.isCompleted && <span className="text-[10px] text-sky-400 font-mono">✓</span>}
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-sky-400 rounded-full" 
                          style={{ width: `${s.pct}%` }} 
                        />
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono">
                        {s.watched} / {s.total} حلقة
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {lastListened?.episode && (
              <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>آخر نشاط استماع</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {lastPlayedProgress}% من الحلقة
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{lastListened.episode.title}</h4>
                    <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      توقفت عند الدقيقة {Math.floor(lastListened.currentTime / 60)}:{(Math.floor(lastListened.currentTime % 60) < 10 ? '0' : '') + Math.floor(lastListened.currentTime % 60)}
                    </span>
                  </div>

                  <Link
                    href={`/episodes/${lastListened.episode.slug || lastListened.episode.id}?t=${Math.floor(lastListened.currentTime)}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all flex-shrink-0"
                  >
                    <span>متابعة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${lastPlayedProgress}%` }}
                  />
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
