'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Episode } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useBookmarksStore } from '@/store/useBookmarksStore';
import { Play, Headphones, Clock, Check, Bookmark } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const { playEpisode } = usePlayerStore();
  const { user, openAuthModal } = useAuthStore();
  const { isCompleted, toggleComplete } = useProgressStore();
  const { isBookmarked, toggleBookmark } = useBookmarksStore();

  const completed = isCompleted(episode.id);
  const bookmarked = isBookmarked(episode.id);

  // جلب الغلاف الأصلي فائق الجودة من يوتيوب مباشرة
  const initialThumb = episode.youtube_video_id
    ? `https://img.youtube.com/vi/${episode.youtube_video_id}/maxresdefault.jpg`
    : episode.thumbnail_url;

  const [imgSrc, setImgSrc] = useState(initialThumb);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    toggleComplete(user.id, episode.id);
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(episode.id);
  };

  return (
    <div className={`group relative flex flex-col rounded-3xl bg-zinc-900/50 border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
      completed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-zinc-800/80 hover:border-zinc-700'
    }`}>
      {/* صورة الغلاف الرسمية من يوتيوب */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <img
          src={imgSrc}
          alt={episode.title}
          onError={() => {
            // في حال لم يكن متاحاً بدقة maxresdefault يتحول تلقائياً لـ hqdefault
            if (episode.youtube_video_id) {
              setImgSrc(`https://img.youtube.com/vi/${episode.youtube_video_id}/hqdefault.jpg`);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* أزرار الإجراءات السريعة (الإتمام والمفضلة) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={handleToggleComplete}
            title={completed ? 'تمت المشاهدة (مكتملة)' : 'تحديد كمكتملة'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              completed
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-950/70 text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <button
            onClick={handleToggleBookmark}
            title={bookmarked ? 'إزالة من المحفوظات' : 'حفظ'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              bookmarked
                ? 'bg-amber-400 text-zinc-950 shadow-lg'
                : 'bg-zinc-950/70 text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* رقم الموسم والمدة */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-md text-slate-300 border border-zinc-800/80">
            {episode.program === 'ala-el-maghreb' ? `عالـمغرب • م${episode.season}` : `الموسم ${episode.season}`} • ح{episode.episode_number}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-md text-zinc-300 font-mono border border-zinc-800/80">
            <Clock className="w-3 h-3 text-zinc-400" />
            {formatTime(episode.duration_seconds)}
          </span>
        </div>
      </div>

      {/* تفاصيل الحلقة */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="flex flex-col gap-1.5">
          {episode.topic && (
            <span className="text-[10px] font-bold text-zinc-400">
              #{episode.topic}
            </span>
          )}
          <Link href={`/episodes/${episode.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-slate-300 transition-colors">
              {episode.title}
            </h3>
          </Link>
        </div>

        {/* أزرار التشغيل */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
          <button
            onClick={() => playEpisode(episode, 'video')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>فيديو</span>
          </button>

          <button
            onClick={() => playEpisode(episode, 'audio')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>صوت</span>
          </button>
        </div>
      </div>
    </div>
  );
}
