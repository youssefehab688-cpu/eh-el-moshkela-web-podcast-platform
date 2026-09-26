'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeCard from '@/components/EpisodeCard';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // قراءة المحفوظات من السجل الموحد
  const readLocalBookmarks = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      setSavedItems(Array.isArray(raw) ? raw : []);
    } catch {
      setSavedItems([]);
    }
  };

  useEffect(() => {
    readLocalBookmarks();

    async function fetchEpisodes() {
      try {
        const { data, error } = await supabase.from('episodes').select('*');
        if (data && !error) {
          setEpisodes(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();

    // الاستماع للتحديثات اللحظية
    window.addEventListener('app_storage_updated', readLocalBookmarks);
    window.addEventListener('storage', readLocalBookmarks);

    return () => {
      window.removeEventListener('app_storage_updated', readLocalBookmarks);
      window.removeEventListener('storage', readLocalBookmarks);
    };
  }, []);

  // استخراج الحلقات المحفوظة مع مطابقة المعرفات وتنظيف البيانات المعطوبة
  const bookmarkedEpisodes = useMemo(() => {
    if (!savedItems.length) return [];

    const matched: Episode[] = [];
    const validIds = new Set<string>();

    savedItems.forEach((item) => {
      const targetId = typeof item === 'string' ? item : item?.id;
      if (!targetId) return;

      const foundInDb = episodes.find((ep) => ep.id === targetId);
      if (foundInDb) {
        matched.push(foundInDb);
        validIds.add(targetId);
      } else if (typeof item === 'object' && item?.title && item?.youtube_video_id) {
        // حلقة محفوظة ببياناتها الكاملة
        matched.push(item as Episode);
        validIds.add(item.id);
      }
    });

    return matched;
  }, [savedItems, episodes]);

  // تنظيف أي عنصر قديم معلق غير موجود في الحلقات لتصحيح العداد تلقائياً
  useEffect(() => {
    if (!loading && episodes.length > 0 && savedItems.length > 0) {
      if (bookmarkedEpisodes.length !== savedItems.length) {
        const cleaned = savedItems.filter((item) => {
          const id = typeof item === 'string' ? item : item?.id;
          return episodes.some((ep) => ep.id === id);
        });

        localStorage.setItem('eh_el_moshkla_bookmarks', JSON.stringify(cleaned));
        setSavedItems(cleaned);
        window.dispatchEvent(new Event('app_storage_updated'));
      }
    }
  }, [loading, episodes, savedItems, bookmarkedEpisodes.length]);

  // إفراغ سلة المحفوظات بالكامل بنقرة واحدة
  const handleClearAll = () => {
    localStorage.setItem('eh_el_moshkla_bookmarks', JSON.stringify([]));
    setSavedItems([]);
    window.dispatchEvent(new Event('app_storage_updated'));
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-24 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">المحفوظات</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono font-bold border border-amber-400/20">
                  {bookmarkedEpisodes.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400">الحلقات التي قمت بحفظها للرجوع إليها لاحقاً</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bookmarkedEpisodes.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors"
                title="مسح كل المحفوظات"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ المحفوظات</span>
              </button>
            )}

            <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors">
              <span>كل الحلقات</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          </div>
        ) : bookmarkedEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bookmarkedEpisodes.map((ep, idx) => (
              <EpisodeCard key={ep.id} episode={ep} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
            <Bookmark className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">قائمة المحفوظات فارغة</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              اضغط على أيقونة الحفظ على أي حلقة لإضافتها هنا والرجوع إليها في أي وقت.
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors"
            >
              استكشف الحلقات
            </Link>
          </div>
        )}
      </div>

      <Player />
    </main>
  );
}
