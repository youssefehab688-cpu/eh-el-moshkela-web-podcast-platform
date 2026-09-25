'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Episode } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Search, X, Play, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodes?: Episode[];
}

export default function SearchModal({ isOpen, onClose, episodes = [] }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { playlist, playEpisode } = usePlayerStore();

  const allEpisodes = episodes.length > 0 ? episodes : playlist;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return allEpisodes.filter((ep) => {
      const titleMatch = (ep.title || '').toLowerCase().includes(q);
      const descMatch = (ep.description || '').toLowerCase().includes(q);
      const topicMatch = (ep.topic || '').toLowerCase().includes(q);
      const numberMatch = `حلقة ${ep.episode_number}`.includes(q) || `موسم ${ep.season}`.includes(q);
      return titleMatch || descMatch || topicMatch || numberMatch;
    });
  }, [query, allEpisodes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-right">
        
        {/* شريط الإدخال */}
        <div className="relative flex items-center">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في جميع الحلقات، الموضوعات، الأفكار..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pr-11 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-slate-400"
          />
          <Search className="w-5 h-5 text-zinc-400 absolute right-3.5 pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute left-3 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* قائمة النتائج */}
        <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">
          {results.length > 0 ? (
            results.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  router.push(`/episodes/${ep.slug}`);
                  onClose();
                }}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                    <img src={ep.thumbnail_url} alt={ep.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-300">
                      {ep.program === 'ala-el-maghreb' ? `عالـمغرب ${ep.season}` : `الموسم ${ep.season}`} • حلقة {ep.episode_number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-slate-200">
                      {ep.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(ep.duration_seconds)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playEpisode(ep, 'video');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-white text-zinc-400 hover:text-zinc-950 transition-colors"
                    title="تشغيل فوري"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              لم نجد أي نتائج تطابق "{query}"
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              اكتب كلمة للبحث في الحلقات والموضوعات
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
