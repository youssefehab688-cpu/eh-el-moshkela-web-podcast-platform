'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Episode } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Headphones, Clock, Check, Bookmark, BookmarkCheck } from 'lucide-react';

interface EpisodeCardProps {
  episode: Episode;
  index?: number;
}

function getCleanVideoId(rawId?: string): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  return trimmed.split('?')[0].split('&')[0];
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function EpisodeCard({ episode, index = 0 }: EpisodeCardProps) {
  const { playEpisode, currentEpisode } = usePlayerStore();
  const cleanId = useMemo(() => getCleanVideoId(episode.youtube_video_id), [episode.youtube_video_id]);

  const [attempt, setAttempt] = useState<number>(0);
  const [isWatched, setIsWatched] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const isCurrent = currentEpisode?.id === episode.id || currentEpisode?.youtube_video_id === cleanId;

  // فحص المشاهدة، والحفظ، وشريط الإنجاز
  useEffect(() => {
    setAttempt(0);
    try {
      // 1. فحص المشاهدة
      const watchedList = JSON.parse(localStorage.getItem('eh_el_moshkla_watched') || '[]');
      setIsWatched(watchedList.includes(episode.id));

      // 2. فحص المحفوظات
      const bMarks: any[] = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      const exists = bMarks.some((b: any) =>
        typeof b === 'string' ? b === episode.id : b?.id === episode.id
      );
      setIsBookmarked(exists);

      // 3. فحص تقدم التشغيل
      const last = localStorage.getItem('eh_el_moshkla_last_played');
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed?.episode?.id === episode.id && parsed?.duration > 0) {
          const pct = Math.min(100, Math.round((parsed.currentTime / parsed.duration) * 100));
          setProgressPercent(pct);
        }
      }
    } catch (e) {}

    // الاستماع لأي تحديث لحظي للمحفوظات من باقي التطبيق
    const handleStorageChange = () => {
      try {
        const bMarks: any[] = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
        setIsBookmarked(bMarks.some((b: any) => typeof b === 'string' ? b === episode.id : b?.id === episode.id));
      } catch (e) {}
    };

    window.addEventListener('app_storage_updated', handleStorageChange);
    return () => window.removeEventListener('app_storage_updated', handleStorageChange);
  }, [cleanId, episode.id]);

  // تبديل المشاهدة (علامة الصح)
  const toggleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const watchedList: string[] = JSON.parse(localStorage.getItem('eh_el_moshkla_watched') || '[]');
      let updated: string[];
      if (isWatched) {
        updated = watchedList.filter((id) => id !== episode.id);
        setIsWatched(false);
      } else {
        updated = [...watchedList, episode.id];
        setIsWatched(true);
      }
      localStorage.setItem('eh_el_moshkla_watched', JSON.stringify(updated));
    } catch (err) {}
  };

  // تبديل الحفظ (علامة المفضلة)
  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const bMarks: any[] = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      let updated: any[];
      if (isBookmarked) {
        updated = bMarks.filter((b: any) => (typeof b === 'string' ? b !== episode.id : b?.id !== episode.id));
        setIsBookmarked(false);
      } else {
        updated = [episode, ...bMarks.filter((b: any) => (typeof b === 'string' ? b !== episode.id : b?.id !== episode.id))];
        setIsBookmarked(true);
      }
      localStorage.setItem('eh_el_moshkla_bookmarks', JSON.stringify(updated));
      window.dispatchEvent(new Event('app_storage_updated'));
    } catch (err) {}
  };

  const thumbnailSrc = useMemo(() => {
    if (!cleanId) return '/hero-banner.jpg';
    if (attempt === 0) return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
    if (attempt === 1) return `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
    return '/hero-banner.jpg';
  }, [cleanId, attempt]);

  return (
    <div
      style={{ animationDelay: `${(index % 12) * 35}ms` }}
      className={`animate-card-fade group flex flex-col justify-between rounded-3xl p-3 sm:p-3.5 transition-all duration-300 shadow-lg hover:-translate-y-1 ${
        isCurrent
          ? 'bg-zinc-900/80 border border-amber-400/50 shadow-amber-950/20 ring-1 ring-amber-400/30'
          : 'bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-amber-400/40 hover:shadow-[0_0_20px_-5px_rgba(251,191,36,0.12)]'
      }`}
    >
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 flex-shrink-0">
        <img
          src={thumbnailSrc}
          alt={episode.title}
          onError={() => setAttempt((p) => p + 1)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* زر تم الاستماع (أعلى اليمين) */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            onClick={toggleWatched}
            title={isWatched ? 'إلغاء التحديد' : 'تحديد كـ تم الاستماع'}
            className={`p-1.5 rounded-full transition-all duration-200 backdrop-blur-md active:scale-90 ${
              isWatched
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/80'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* زر الحفظ الجديد (أعلى اليسار) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <button
            onClick={toggleBookmark}
            title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الحلقة'}
            className={`p-1.5 rounded-full transition-all duration-200 backdrop-blur-md active:scale-90 ${
              isBookmarked
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/30'
                : 'bg-black/60 text-zinc-400 hover:text-amber-400 hover:bg-black/80'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* مدة الحلقة بصيغة الساعات والدقائق والثواني */}
        {episode.duration_seconds && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formatDuration(episode.duration_seconds)}</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10">
          {episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'الموسم'} {episode.season} • حـ{episode.episode_number}
        </div>

        {/* شريط الإنجاز الذهبي */}
        {progressPercent > 0 && !isWatched && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800/80">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 py-3 text-right">
        {episode.topic && (
          <span className="text-[10px] font-bold text-amber-400/90 truncate">
            #{episode.topic}
          </span>
        )}

        <Link
          href={`/episodes/${episode.slug || episode.id}`}
          className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug"
        >
          {episode.title}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
        <button
          onClick={() => playEpisode(episode, 'audio')}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition-all active:scale-95"
        >
          <Headphones className="w-3.5 h-3.5 text-amber-400" />
          <span>صوت</span>
        </button>

        <button
          onClick={() => playEpisode(episode, 'video')}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>فيديو</span>
        </button>
      </div>
    </div>
  );
}
