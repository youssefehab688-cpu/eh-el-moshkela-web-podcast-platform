'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { mockEpisodes } from '@/data/mockEpisodes';
import { formatTime } from '@/lib/utils';
import { Play, RotateCcw, X } from 'lucide-react';

export default function ContinueListening() {
  const { lastEpisodeId, progress } = useUserStore();
  const { playEpisode, currentEpisode, isPlaying } = usePlayerStore();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || dismissed || !lastEpisodeId) return null;

  const episode = mockEpisodes.find((ep) => ep.id === lastEpisodeId);
  const savedTime = progress[lastEpisodeId] || 0;

  if (!episode || savedTime < 10 || (currentEpisode?.id === episode.id && isPlaying)) {
    return null;
  }

  const handleResume = () => {
    // تشغيل الحلقة مباشرة عند اللحظة المحفوظة
    playEpisode(episode, 'audio', savedTime);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 -mt-6 sm:-mt-8 mb-8 relative z-30">
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-zinc-800 text-slate-200 border border-zinc-700 flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-slate-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                متابعة الاستماع
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                توقفت عند {formatTime(savedTime)}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {episode.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleResume}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>استئناف</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-zinc-400 hover:text-white"
            title="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
