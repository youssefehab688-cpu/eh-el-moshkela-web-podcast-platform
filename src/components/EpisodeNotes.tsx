'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { formatTime } from '@/lib/utils';
import { FileText, Plus, Trash2, Clock, Play, Cloud, CloudOff, Sparkles } from 'lucide-react';

interface Note {
  id: string;
  episodeId: string;
  episodeTitle: string;
  time: number;
  text: string;
  createdAt: string;
  isCloud?: boolean;
}

interface EpisodeNotesProps {
  episodeId: string;
  episodeTitle: string;
}

export default function EpisodeNotes({ episodeId, episodeTitle }: EpisodeNotesProps) {
  const { user, openAuthModal } = useAuthStore();
  const { currentTime, seekTo } = usePlayerStore();

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);

  // مفتاح التخزين المحلي كاحتياطي للزائر
  const localKey = `eh_notes_${episodeId}`;

  // 1. تحميل الملاحظات (سحابياً إذا كان مسجلاً، ومحلياً إذا كان زائراً)
  useEffect(() => {
    async function loadNotes() {
      if (user) {
        // قراءة الملاحظات السحابية من Supabase
        const { data, error } = await supabase
          .from('user_notes')
          .select('*')
          .eq('episode_id', episodeId)
          .order('time_seconds', { ascending: true });

        if (!error && data) {
          const cloudNotes: Note[] = data.map((item) => ({
            id: item.id,
            episodeId: item.episode_id,
            episodeTitle: item.episode_title,
            time: item.time_seconds,
            text: item.text,
            createdAt: item.created_at,
            isCloud: true,
          }));

          // التحقق مما إذا كانت هناك ملاحظات محلية سابقة لرفعها سحابياً تلقائياً
          const localRaw = localStorage.getItem(localKey);
          if (localRaw) {
            try {
              const localList: Note[] = JSON.parse(localRaw);
              if (localList.length > 0) {
                for (const lNote of localList) {
                  await supabase.from('user_notes').insert([
                    {
                      user_id: user.id,
                      episode_id: episodeId,
                      episode_title: episodeTitle,
                      time_seconds: Math.floor(lNote.time),
                      text: lNote.text,
                    },
                  ]);
                }
                localStorage.removeItem(localKey);
                // إعادة الجلب بعد الترقية
                const { data: updated } = await supabase
                  .from('user_notes')
                  .select('*')
                  .eq('episode_id', episodeId)
                  .order('time_seconds', { ascending: true });

                if (updated) {
                  setNotes(
                    updated.map((item) => ({
                      id: item.id,
                      episodeId: item.episode_id,
                      episodeTitle: item.episode_title,
                      time: item.time_seconds,
                      text: item.text,
                      createdAt: item.created_at,
                      isCloud: true,
                    }))
                  );
                  return;
                }
              }
            } catch {}
          }

          setNotes(cloudNotes);
        }
      } else {
        // قراءة الملاحظات المحلية للزائر غير المسجل
        const localRaw = localStorage.getItem(localKey);
        if (localRaw) {
          try {
            setNotes(JSON.parse(localRaw));
          } catch {
            setNotes([]);
          }
        } else {
          setNotes([]);
        }
      }
    }

    loadNotes();
  }, [user, episodeId, episodeTitle, localKey]);

  // 2. حفظ ملاحظة جديدة
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const currentSec = Math.floor(currentTime);
    setLoading(true);

    if (user) {
      // حفظ في Supabase
      try {
        const { data, error } = await supabase
          .from('user_notes')
          .insert([
            {
              user_id: user.id,
              episode_id: episodeId,
              episode_title: episodeTitle,
              time_seconds: currentSec,
              text: noteText.trim(),
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const newNote: Note = {
            id: data.id,
            episodeId: data.episode_id,
            episodeTitle: data.episode_title,
            time: data.time_seconds,
            text: data.text,
            createdAt: data.created_at,
            isCloud: true,
          };
          setNotes((prev) => [...prev, newNote].sort((a, b) => a.time - b.time));
          setNoteText('');
        }
      } catch (err) {
        console.error('Error saving cloud note:', err);
      }
    } else {
      // حفظ محلي في المتصفح
      const newNote: Note = {
        id: `note_${Date.now()}`,
        episodeId,
        episodeTitle,
        time: currentSec,
        text: noteText.trim(),
        createdAt: new Date().toISOString(),
        isCloud: false,
      };

      const updated = [...notes, newNote].sort((a, b) => a.time - b.time);
      setNotes(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch {}
      setNoteText('');
    }

    setLoading(false);
  };

  // 3. حذف ملاحظة
  const handleDeleteNote = async (noteId: string, isCloud?: boolean) => {
    if (user && isCloud) {
      await supabase.from('user_notes').delete().eq('id', noteId);
    }
    const filtered = notes.filter((n) => n.id !== noteId);
    setNotes(filtered);
    if (!user) {
      try {
        localStorage.setItem(localKey, JSON.stringify(filtered));
      } catch {}
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-sm shadow-xl flex flex-col gap-5">
      
      {/* رأس قسم الملاحظات مع مؤشر الحالة السحابية */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            الملاحظات الشخصية والتأملات
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {notes.length}
          </span>
        </div>

        {/* شارة حالة المزامنة السحابية */}
        {user ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <Cloud className="w-3.5 h-3.5" />
            <span>مزامنة سحابية نشطة</span>
          </span>
        ) : (
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-full hover:bg-amber-900/50 transition-colors"
            title="سجّل دخولك لحفظ ملاحظاتك ومزامنتها على السحابة"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>حفظ محلي (سجّل للمزامنة ☁️)</span>
          </button>
        )}
      </div>

      {/* استمارة كتابة الملاحظة */}
      <form onSubmit={handleAddNote} className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>توقيت التسجيل اللحظي:</span>
            <strong className="text-white bg-zinc-800/90 px-2 py-0.5 rounded-md border border-zinc-700/60">
              {formatTime(currentTime)}
            </strong>
          </span>
          <span className="text-[11px] text-zinc-500">يتم تثبيت الثانية الحالية تلقائياً</span>
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="اكتب فكرة أعجبتك، فائدة، أو تساؤل من الحلقة..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-slate-400 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading || !noteText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{loading ? 'جاري الحفظ...' : 'حفظ الملاحظة'}</span>
          </button>
        </div>
      </form>

      {/* قائمة الملاحظات المسجلة */}
      <div className="flex flex-col gap-2.5 pt-2">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* زر القفز للثانية المحددة */}
                <button
                  type="button"
                  onClick={() => seekTo(note.time)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-slate-400 text-[11px] font-mono font-bold text-slate-300 hover:text-white transition-colors flex-shrink-0"
                  title="القفز وتشغيل الفيديو من هذا التوقيت"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{formatTime(note.time)}</span>
                </button>

                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-wrap flex-1 pt-0.5">
                  {note.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteNote(note.id, note.isCloud)}
                className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                title="حذف الملاحظة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/70 rounded-2xl">
            لا توجد ملاحظات مسجلة لهذه الحلقة بعد. اكتب فكرتك أعلاه وستُحفظ فوراً مع التوقيت.
          </div>
        )}
      </div>

    </div>
  );
}
