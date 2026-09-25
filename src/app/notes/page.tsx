'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { Note, Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { formatTime } from '@/lib/utils';
import { BookOpen, Trash2, Play, ArrowRight, User } from 'lucide-react';

export default function NotesPage() {
  const { user } = useAuthStore();
  const { playEpisode } = usePlayerStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [episodesMap, setEpisodesMap] = useState<Record<string, Episode>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: notesData } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesData) setNotes(notesData);

      const { data: epData } = await supabase.from('episodes').select('*');
      if (epData) {
        const map: Record<string, Episode> = {};
        epData.forEach((ep: Episode) => {
          map[ep.id] = ep;
        });
        setEpisodesMap(map);
      }

      setLoading(false);
    }

    loadData();
  }, [user?.id]);

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    await supabase.from('user_notes').delete().eq('id', noteId);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">دفتر الملاحظات والفوائد</h1>
              <p className="text-xs text-zinc-400">جميع الخواطر والفوائد التي دونتها متزامنة مع وقت الحلقات</p>
            </div>
          </div>

          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors">
            <span>الرئيسية</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        {!user ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-6">
            <User className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">يرجى تسجيل الدخول</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              سجل دخولك بحسابك لتتمكن من حفظ الملاحظات واسترجاعها من أي جهاز في أي وقت.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => {
              const ep = episodesMap[note.episode_id];
              return (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-300 truncate max-w-[200px]">
                        {note.episode_title || ep?.title || 'حلقة غير محددة'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        {formatTime(note.time_seconds || 0)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                      {note.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                    {ep ? (
                      <button
                        onClick={() => playEpisode(ep, 'video')}
                        className="flex items-center gap-1.5 text-xs text-white hover:text-slate-300 font-bold"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>تشغيل الحلقة عند التوقيت</span>
                      </button>
                    ) : <span />}

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف الملاحظة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
            <BookOpen className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">لا توجد ملاحظات مسجلة بعد</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              أثناء استماعك لأي حلقة، يمكنك تدوين أي فائدة أو خاطرة لتُحفظ متزامنة مع الدقيقة التي استمعت إليها.
            </p>
          </div>
        )}
      </div>

      <Player />
    </main>
  );
}
