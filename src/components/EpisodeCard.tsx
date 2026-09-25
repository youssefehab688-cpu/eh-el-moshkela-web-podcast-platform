'use client';

import { useEffect } from 'react';
import { Episode } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { formatTime } from '@/lib/utils';
import { Play, Pause, FileEdit, Clock, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const router = useRouter();
  const { currentEpisode, isPlaying, playEpisode, togglePlay } = usePlayerStore();
  const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarkStore();

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const isCurrent = currentEpisode?.id === episode.id;
  const bookmarked = isBookmarked(episode.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playEpisode(episode, 'video');
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(episode.id);
  };

  const handleCardClick = () => {
    router.push(`/episodes/${episode.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-2xl bg-zinc-900/40 border overflow-hidden transition-all duration-300 shadow-lg cursor-pointer ${
        isCurrent ? 'border-slate-400 bg-zinc-900/80 shadow-slate-400/5' : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
      }`}
    >
      {/* الغلاف والمدة وأزرار الإجراءات */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
        <img
          src={episode.thumbnail_url}
          alt={episode.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

        {/* شارة الموسم والحلقة */}
        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-zinc-950/85 border border-zinc-700/80 text-[10px] font-bold text-slate-300 backdrop-blur-md">
          {episode.program === 'ala-el-maghreb' ? `عالـمغرب ${episode.season}` : `سيزون ${episode.season}`} • حلقة {episode.episode_number}
        </span>

        {/* زر الحفظ في المفضلة العائم */}
        <button
          onClick={handleBookmarkClick}
          aria-label={bookmarked ? 'إزالة من المحفوظات' : 'حفظ الحلقة'}
          className={`absolute top-2.5 left-2.5 p-2 rounded-xl backdrop-blur-md border transition-all z-20 ${
            bookmarked
              ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-lg scale-105 opacity-100'
              : 'bg-zinc-950/70 border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-500 opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={bookmarked ? 'الحلقة محفوظة بالمفضلة' : 'حفظ في المفضلة'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* مدة الحلقة */}
        <span className="absolute bottom-2.5 right-2.5 text-[11px] font-mono font-bold text-zinc-300 bg-zinc-950/90 px-2 py-0.5 rounded-md border border-zinc-800 backdrop-blur-sm flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatTime(episode.duration_seconds)}
        </span>

        {/* زر التشغيل العائم في المنتصف */}
        <button
          onClick={handlePlayClick}
          aria-label={isCurrent && isPlaying ? "إيقاف مؤقت للحلقة" : "تشغيل الحلقة"}
          className={`absolute inset-0 m-auto h-12 w-12 rounded-full flex items-center justify-center transition-all ${
            isCurrent
              ? 'bg-white text-zinc-950 scale-100 shadow-xl'
              : 'bg-zinc-950/80 text-white border border-zinc-700 opacity-0 group-hover:opacity-100 hover:scale-110'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-zinc-950" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-[1px]" />
          )}
        </button>
      </div>

      {/* تفاصيل البطاقة */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-slate-300">{episode.topic}</span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-2 leading-snug">
            {episode.title}
          </h3>
        </div>

        {/* شريط الإجراءات السفلي */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
          <span className="text-slate-400 font-semibold group-hover:text-white transition-colors flex items-center gap-1">
            <FileEdit className="w-3.5 h-3.5" />
            <span>التفاصيل والملاحظات</span>
          </span>
          <span className="text-[11px] text-zinc-500">
            {episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة'}
          </span>
        </div>
      </div>
    </div>
  );
}
