'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeCard from '@/components/EpisodeCard';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { formatTime } from '@/lib/utils';
import {
  Bookmark, FileText, Trash2, Download, Play, 
  Search, FolderHeart, Cloud, CloudOff
} from 'lucide-react';

interface SavedNoteItem {
  id: string;
  episodeId: string;
  episodeTitle: string;
  time: number;
  text: string;
  createdAt: string;
  isCloud?: boolean;
}

export default function SavedPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookmarkedIds, loadBookmarks } = useBookmarkStore();
  const { playEpisode } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'episodes' | 'notes'>('episodes');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<SavedNoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // 1. تحميل الحلقات المحفوظة
  useEffect(() => {
    async function fetchBookmarkedEpisodes() {
      if (bookmarkedIds.length === 0) {
        setEpisodes([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .in('id', bookmarkedIds);

        if (!error && data) {
          setEpisodes(data as Episode[]);
        }
      } catch (err) {
        console.error('Error fetching saved episodes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedEpisodes();
  }, [bookmarkedIds]);

  // 2. تحميل الملاحظات سحابياً أو محلياً
  const loadAllNotes = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const cloudList: SavedNoteItem[] = data.map((item) => ({
            id: item.id,
            episodeId: item.episode_id,
            episodeTitle: item.episode_title,
            time: item.time_seconds,
            text: item.text,
            createdAt: item.created_at,
            isCloud: true,
          }));
          setNotes(cloudList);
          return;
        }
      } catch (err) {
        console.error('Error fetching cloud notes:', err);
      }
    }

    // fallback للقراءة من التخزين المحلي
    try {
      const localNotes: SavedNoteItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('notes_') || key.startsWith('eh_notes_'))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              localNotes.push(...parsed);
            }
          }
        }
      }
      localNotes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNotes(localNotes);
    } catch (err) {
      console.error('Error loading local notes:', err);
    }
  };

  useEffect(() => {
    loadAllNotes();
  }, [user]);

  // حذف ملاحظة
  const handleDeleteNote = async (noteId: string, episodeId: string, isCloud?: boolean) => {
    if (user && isCloud) {
      await supabase.from('user_notes').delete().eq('id', noteId);
    } else {
      const key = `eh_notes_${episodeId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const filtered = parsed.filter((n: any) => n.id !== noteId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
    loadAllNotes();
  };

  // تصدير كملف نصي
  const handleExportNotes = () => {
    if (notes.length === 0) return;
    let content = `ملاحظات وتأملات بودكاست إيه المشكلة وعالـمغرب\nتم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
    content += `=========================================\n\n`;

    notes.forEach((note, index) => {
      content += `[${index + 1}] حلقة: ${note.episodeTitle || 'حلقة غير معنونة'}\n`;
      content += `التوقيت: ${formatTime(note.time)}\n`;
      content += `الملاحظة: ${note.text}\n`;
      content += `-----------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eh-el-moshkla-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodes;
    const q = searchQuery.toLowerCase();
    return episodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        (ep.topic && ep.topic.toLowerCase().includes(q))
    );
  }, [episodes, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.text.toLowerCase().includes(q) ||
        (n.episodeTitle && n.episodeTitle.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      <section className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 to-zinc-950 py-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FolderHeart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  المحفوظات والملاحظات
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  مساحتك الخاصة للرجوع للحلقات المميزة ومراجعة أفكارك وتأملاتك المدونة
                </p>
              </div>
            </div>

            {notes.length > 0 && activeTab === 'notes' && (
              <button
                onClick={handleExportNotes}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-white transition-colors self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تصدير الملاحظات (.txt)</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center bg-zinc-900/80 border border-zinc-800 p-1 rounded-2xl shadow-inner self-start">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'episodes'
                    ? 'bg-zinc-100 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>الحلقات المفضلة ({episodes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-zinc-100 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ملاحظاتي المدونة ({notes.length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'episodes' ? 'ابحث في الحلقات المفضلة...' : 'ابحث في الملاحظات...'}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-2 pr-9 pl-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-slate-400"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 flex-1">
        {activeTab === 'episodes' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
              </div>
            ) : filteredEpisodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredEpisodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
                <Bookmark className="w-12 h-12 text-zinc-600" />
                <h3 className="text-base font-bold text-white">لا توجد حلقات محفوظة حالياً</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  اضغط على أيقونة الإشارة المرجعية (Bookmark) الموجودة على أي حلقة لحفظها والوصول إليها هنا بسرعة.
                </p>
                <Link
                  href="/"
                  className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
                >
                  استكشف الحلقات
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col justify-between gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-zinc-700 transition-all shadow-md group"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 truncate max-w-[200px] sm:max-w-xs">
                          {note.episodeTitle}
                        </span>
                        
                        <button
                          onClick={() => {
                            if (note.episodeId) {
                              const found = episodes.find((e) => e.id === note.episodeId);
                              if (found) {
                                playEpisode(found, 'video', note.time);
                                router.push(`/episodes/${found.slug}`);
                              } else {
                                router.push(`/episodes/${note.episodeId}`);
                              }
                            }
                          }}
                          className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-300 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 hover:border-slate-500 transition-colors"
                          title="تشغيل الحلقة من هذا التوقيت"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{formatTime(note.time)}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        {note.isCloud ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Cloud className="w-3 h-3" />
                            سحابي
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-zinc-500">
                            <CloudOff className="w-3 h-3" />
                            محلي
                          </span>
                        )}
                        <span>•</span>
                        <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString('ar-EG') : ''}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id, note.episodeId, note.isCloud)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
                <FileText className="w-12 h-12 text-zinc-600" />
                <h3 className="text-base font-bold text-white">لم تدون أي ملاحظات بعد</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  أثناء استماعك لأي حلقة، اكتب أفكارك في خانة الملاحظات وسيتم حفظها ومزامنتها سحابياً وتجميعها هنا.
                </p>
              </div>
            )}
          </div>
        )}

      </section>

      <Player />
    </main>
  );
}
