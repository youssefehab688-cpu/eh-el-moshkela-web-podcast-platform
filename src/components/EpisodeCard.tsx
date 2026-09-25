'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Episode } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Headphones, Clock, Sparkles } from 'lucide-react';

interface EpisodeCardProps {
  episode: Episode;
}

// دالة تنظيف واستخراج معرّف يوتيوب النقي من أي صيغة رابط
function getCleanVideoId(rawId?: string): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  // تنظيف أي بارامترات إضافية مثل ?si=
  return trimmed.split('?')[0].split('&')[0];
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const { playEpisode } = usePlayerStore();
  
  // استخراج المعرف النقي
  const cleanId = useMemo(() => getCleanVideoId(episode.youtube_video_id), [episode.youtube_video_id]);

  // تسلسل المحاولات: 0 = hqdefault (الأكثر ضماناً) -> 1 = mqdefault -> 2 = hero-banner احتياطي
  const [attempt, setAttempt] = useState<number>(0);

  // إعادة ضبط الحالة عند تغير الحلقة أو الفلترة
  useEffect(() => {
    setAttempt(0);
  }, [cleanId]);

  const thumbnailSrc = useMemo(() => {
    if (!cleanId) return '/hero-banner.jpg';
    if (attempt === 0) return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
    if (attempt === 1) return `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
    return '/hero-banner.jpg';
  }, [cleanId, attempt]);

  const handleImageError = () => {
    setAttempt((prev) => prev + 1);
  };

  return (
    <div className="group flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-amber-400/40 rounded-3xl p-3 sm:p-3.5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
      
      {/* الصورة المصغرة مع التوقيت وشارة الموسم */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 flex-shrink-0">
        <img
          src={thumbnailSrc}
          alt={episode.title}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* مدة الحلقة */}
        {episode.duration_seconds && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formatDuration(episode.duration_seconds)}</span>
          </div>
        )}

        {/* شارة الموسم والحلقة */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10">
          {episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'الموسم'} {episode.season} • حـ{episode.episode_number}
        </div>
      </div>

      {/* تفاصيل الحلقة */}
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

      {/* أزرار التشغيل: صوت / فيديو */}
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
