'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { ExtendedEpisode } from '@/data/mockEpisodes';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUserStore } from '@/store/useUserStore';
import { formatTime } from '@/lib/utils';
import { 
  Play, Video, Headphones, BookOpen, Clock, 
  Send, Trash2, ArrowRight, Bookmark 
} from 'lucide-react';
import Link from 'next/link';

interface LocalNote {
  id: string;
  time: number;
  text: string;
  createdAt: string;
}

interface EpisodeClientProps {
  episode: ExtendedEpisode;
}

export default function EpisodeClient({ episode }: EpisodeClientProps) {
  const { currentEpisode, isPlaying, currentTime, playEpisode, seekTo } = usePlayerStore();
  const { isFavorite, toggleFavorite, progress } = useUserStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isCurrentPlaying = currentEpisode?.id === episode.id && isPlaying;
  const isFav = mounted ? isFavorite(episode.id) : false;
  const savedProgress = mounted ? progress[episode.id] || 0 : 0;

  // إدارة الملاحظات وتخزينها محلياً
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`notes_${episode.id}`);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, [episode.id]);

  const saveNotes = (updated: LocalNote[]) => {
    setNotes(updated);
    localStorage.setItem(`notes_${episode.id}`, JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteTime = currentEpisode?.id === episode.id ? Math.floor(currentTime) : 0;

    const newNote: LocalNote = {
      id: Date.now().toString(),
      time: noteTime,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    saveNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  const handlePlay = (mode: 'audio' | 'video') => {
    playEpisode(episode, mode, savedProgress > 0 ? savedProgress : undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-32">
      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجميع الحلقات</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* العمود الأيمن (المحتوى والعرض) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
              <img
                src={episode.thumbnail_url}
                alt={episode.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs font-semibold text-zinc-300">
                    الموسم {episode.season} • حلقة {episode.episode_number} • المدة: {formatTime(episode.duration_seconds)}
                  </span>
                  <button
                    onClick={() => toggleFavorite(episode.id)}
                    className="p-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    <Bookmark className={`w-4 h-4 ${isFav ? 'fill-slate-200 text-slate-200' : ''}`} />
                  </button>
                </div>
                
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white max-w-xl leading-snug">
                  {episode.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={() => handlePlay('audio')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm shadow-xl transition-all"
                  >
                    <Headphones className="w-4 h-4 fill-zinc-950" />
                    <span>{isCurrentPlaying ? 'الحلقة تعمل الآن' : savedProgress > 10 ? 'متابعة الاستماع' : 'استماع صوتي'}</span>
                  </button>

                  <button
                    onClick={() => handlePlay('video')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-sm transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>مشاهدة الفيديو</span>
                  </button>
                </div>
              </div>
            </div>

            {/* تفاصيل الجلسة */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-3">عن هذه الجلسة</h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                {episode.description}
              </p>
            </div>

            {/* التوصيات والكتب */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <BookOpen className="w-5 h-5 text-slate-300" />
                <span>الكتب والتوصيات المذكورة بالحلقة</span>
              </div>

              {episode.recommendations && episode.recommendations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {episode.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-slate-300 border border-zinc-800">
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200">{rec.title}</h4>
                          <span className="text-xs text-zinc-400">المؤلف / المصدر: {rec.author_or_source || 'غير محدد'}</span>
                        </div>
                      </div>

                      {rec.external_url && (
                        <a
                          href={rec.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-300 hover:underline font-semibold"
                        >
                          تصفح المصدر
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">لم يتم إدراج توصيات لهذه الحلقة بعد.</p>
              )}
            </div>

          </div>

          {/* العمود الأيسر (الملاحظات المربوطة بالدقيقة) */}
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-sm sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Clock className="w-4 h-4 text-slate-300" />
                  <span>ملاحظاتي على الحلقة</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {formatTime(currentTime)}
                </span>
              </div>

              <form onSubmit={handleAddNote} className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="سجل فكرة أو خاطرة... (سيتم ربطها بدقيقة الاستماع الحالية تلقائياً)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-slate-400 resize-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>حفظ الملاحظة عند {formatTime(currentTime)}</span>
                </button>
              </form>

              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (currentEpisode?.id !== episode.id) {
                              playEpisode(episode, 'audio', note.time);
                            } else {
                              seekTo(note.time);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-mono font-bold text-slate-300 transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{formatTime(note.time)}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-zinc-500">
                    لم تقم بتدوين ملاحظات بعد. شغّل الحلقة وسجل خواطرك!
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Player />
    </div>
  );
}
