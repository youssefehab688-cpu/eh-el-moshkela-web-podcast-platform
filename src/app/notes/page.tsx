'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { BookOpen, Download, Trash2, ArrowLeft, Clock } from 'lucide-react';

interface NoteWithEpisode {
  id: string;
  timestamp_seconds: number;
  content: string;
  created_at: string;
  episode_id: string;
  episodes: {
    title: string;
    slug: string;
    season: number;
    episode_number: number;
    program: string;
  };
}

function formatSeconds(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function NotesPage() {
  const { user, openAuthModal } = useAuthStore();
  const [notes, setNotes] = useState<NoteWithEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNotes() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*, episodes (title, slug, season, episode_number, program)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotes(data as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllNotes();
  }, [user]);

  const handleDelete = async (noteId: string) => {
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const exportAllNotes = () => {
    if (notes.length === 0) return;
    const header = `سجل الفوائد والملاحظات الكامل | منصة بودكاست إيه المشكلة؟ وعالـمغرب\nتم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n======================================================\n\n`;
    
    const body = notes.map((n, i) => {
      const ep = n.episodes;
      return `${i + 1}. [${ep?.title || 'حلقة'}] (الموسم ${ep?.season || 1}) - دقيقة [${formatSeconds(n.timestamp_seconds)}]\nالفائدة: ${n.content}\n------------------------------------------------------`;
    }).join('\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل-فوائد-إيه-المشكلة-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span>دفتر الملاحظات والفوائد</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              جميع الفوائد والخواطر التي دوّنتها أثناء الاستماع للحلقات مرتبة ومحفوظة بحسابك.
            </p>
          </div>

          {user && notes.length > 0 && (
            <button
              onClick={exportAllNotes}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير كل الملاحظات (Backup)</span>
            </button>
          )}
        </div>

        {!user ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <p className="text-xs text-zinc-400">سجّل الدخول بحساب Google لحفظ وتصفح فوائدك وملاحظاتك في أي وقت.</p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-200 transition-all shadow"
            >
              تسجيل الدخول
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 text-xs">
            لم تقم بتدوين أي ملاحظة بعد. افتح أي حلقة واستخدم زر «تدوين الملاحظات» أثناء الاستماع.
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all text-right"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-amber-400">{note.episodes?.title}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      [{formatSeconds(note.timestamp_seconds)}]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <Link
                    href={`/episodes/${note.episodes?.slug || note.episode_id}`}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <span>فتح الحلقة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 rounded-xl hover:bg-red-950/40 text-zinc-500 hover:text-red-400 transition-colors"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
