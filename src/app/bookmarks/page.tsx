'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeCard from '@/components/EpisodeCard';
import { useBookmarksStore } from '@/store/useBookmarksStore';
import { Bookmark, ArrowRight } from 'lucide-react';

export default function BookmarksPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookmarks } = useBookmarksStore();

  useEffect(() => {
    async function fetchEpisodes() {
      const { data } = await supabase.from('episodes').select('*');
      if (data) setEpisodes(data);
      setLoading(false);
    }
    fetchEpisodes();
  }, []);

  const bookmarkedEpisodes = useMemo(() => {
    return episodes.filter((ep) => bookmarks.includes(ep.id));
  }, [episodes, bookmarks]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">المحفوظات</h1>
              <p className="text-xs text-zinc-400">الحلقات التي قمت بحفظها للرجوع إليها لاحقاً</p>
            </div>
          </div>

          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors">
            <span>كل الحلقات</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
          </div>
        ) : bookmarkedEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bookmarkedEpisodes.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
            <Bookmark className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">قائمة المحفوظات فارغة</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              اضغط على أيقونة الحفظ على أي حلقة لإضافتها هنا والرجوع إليها في أي وقت.
            </p>
          </div>
        )}
      </div>

      <Player />
    </main>
  );
}
