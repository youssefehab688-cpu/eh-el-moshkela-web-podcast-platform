'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { formatTime } from '@/lib/utils';
import {
  Play, Pause, SkipForward, SkipBack,
  Maximize2, Moon, Radio, Headphones, Video
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

function Replay10Icon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <text x="12" y="12.8" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">10</text>
    </svg>
  );
}

function Forward10Icon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <text x="12" y="12.8" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">10</text>
    </svg>
  );
}

export default function Player() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    mode,
    togglePlay,
    setMode,
    seekTo,
    playEpisode
  } = usePlayerStore();

  if (!currentEpisode) return null;

  const handleSeekDelta = (delta: number) => {
    const target = Math.max(0, Math.min(duration || 99999, currentTime + delta));
    seekTo(target);
  };

  const handleNext = () => {
    const { playlist, currentEpisode } = usePlayerStore.getState();
    if (!currentEpisode || playlist.length === 0) return;

    const currentProg = currentEpisode.program || 'eh-el-moshkla';
    const programEpisodes = playlist.filter((ep) => (ep.program || 'eh-el-moshkla') === currentProg);
    const currentIndex = programEpisodes.findIndex((ep) => ep.id === currentEpisode.id);

    if (currentIndex >= 0 && currentIndex < programEpisodes.length - 1) {
      const nextEp = programEpisodes[currentIndex + 1];
      playEpisode(nextEp, mode, 0);
      if (pathname?.startsWith('/episodes/')) {
        router.push(`/episodes/${nextEp.slug}`);
      }
    }
  };

  const handlePrevious = () => {
    const { playlist, currentEpisode } = usePlayerStore.getState();
    if (!currentEpisode || playlist.length === 0) return;

    const currentProg = currentEpisode.program || 'eh-el-moshkla';
    const programEpisodes = playlist.filter((ep) => (ep.program || 'eh-el-moshkla') === currentProg);
    const currentIndex = programEpisodes.findIndex((ep) => ep.id === currentEpisode.id);

    if (currentIndex > 0) {
      const prevEp = programEpisodes[currentIndex - 1];
      playEpisode(prevEp, mode, 0);
      if (pathname?.startsWith('/episodes/')) {
        router.push(`/episodes/${prevEp.slug}`);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <div className="container mx-auto max-w-7xl flex flex-col gap-2">
        {/* شريط التقدم الزمني النقي المتصل بمحرك الحلقة الفعلي */}
        <div className="relative w-full flex items-center group">
          <input
            type="range"
            min={0}
            max={duration || currentEpisode.duration_seconds || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* تفاصيل الحلقة */}
          <div
            onClick={() => router.push(`/episodes/${currentEpisode.slug}`)}
            className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 sm:flex-initial"
          >
            <div className="relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800">
              <img
                src={currentEpisode.thumbnail_url}
                alt={currentEpisode.title}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold">
                {currentEpisode.program === 'ala-el-maghreb' ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Moon className="w-3 h-3" /> عالـمغرب {currentEpisode.season}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Radio className="w-3 h-3" /> إيه المشكلة {currentEpisode.season}
                  </span>
                )}
                <span>• حلقة {currentEpisode.episode_number}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-slate-200 transition-colors">
                {currentEpisode.title}
              </h4>
            </div>
          </div>

          {/* أزرار التحكم الخمسة */}
          <div className="flex flex-col items-center gap-1">
            <div dir="ltr" className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrevious}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                title="الحلقة السابقة"
              >
                <SkipBack className="w-4 h-4 fill-zinc-400 hover:fill-white" />
              </button>

              <button
                onClick={() => handleSeekDelta(-10)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors flex items-center justify-center"
                title="تأخير 10 ثوانٍ"
              >
                <Replay10Icon className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="h-9 w-9 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md mx-1"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-zinc-950" />
                ) : (
                  <Play className="w-4 h-4 fill-zinc-950 translate-x-[1px]" />
                )}
              </button>

              <button
                onClick={() => handleSeekDelta(10)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors flex items-center justify-center"
                title="تقديم 10 ثوانٍ"
              >
                <Forward10Icon className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                title="الحلقة التالية"
              >
                <SkipForward className="w-4 h-4 fill-zinc-400 hover:fill-white" />
              </button>
            </div>

            <div className="text-[10px] font-mono text-zinc-400 font-semibold">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span>{formatTime(duration || currentEpisode.duration_seconds)}</span>
            </div>
          </div>

          {/* تبديل الوضع (فيديو / صوت) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'video' ? 'audio' : 'video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                mode === 'audio'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="التبديل بين وضع الفيديو ووضع الصوت فقط"
            >
              {mode === 'audio' ? <Headphones className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{mode === 'audio' ? 'صوت فقط' : 'فيديو'}</span>
            </button>

            <button
              onClick={() => router.push(`/episodes/${currentEpisode.slug}`)}
              className="text-zinc-400 hover:text-white p-1"
              title="عرض صفحة وتفاصيل الحلقة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
