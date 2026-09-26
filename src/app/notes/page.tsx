'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { BookOpen, Download, Trash2, ArrowLeft, Clock, Cloud, Sparkles } from 'lucide-react';

interface NormalizedNote {
  id: string;
  timestamp: number;
  content: string;
  created_at?: string;
  episode_id: string;
  episode_title: string;
  episode_slug: string;
}

function formatSeconds(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function NotesPage() {
  const { user, openAuthModal } = useAuthStore();
  const [localNotes, setLocalNotes] = useState<NormalizedNote[]>([]);
  const [cloudNotes, setCloudNotes] = useState<NormalizedNote[]>([]);
  const [loading, setLoading] = useState(true);

  // قراءة الملاحظات المحلية من السجل الموحد
  const readLocalNotes = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('eh_el_moshkla_notes') || '[]');
      if (Array.isArray(raw)) {
        const formatted: NormalizedNote[] = raw.map((item: any) => ({
          id: item.id || Date.now().toString(),
          timestamp: item.timestamp ?? item.timestamp_seconds ?? 0,
          content: item.content ?? item.note_text ?? '',
          created_at: item.created_at || new Date().toISOString(),
          episode_id: item.episode_id || '',
          episode_title: item.episode_title || item.episodes?.title || 'حلقة من البودكاست',
          episode_slug: item.episode_slug || item.episodes?.slug || item.episode_id || '',
        }));
        setLocalNotes(formatted);
      } else {
        setLocalNotes([]);
      }
    } catch {
      setLocalNotes([]);
    }
  };

  useEffect(() => {
    readLocalNotes();

    async function fetchCloudNotes() {
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
          const formatted: NormalizedNote[] = data.map((n: any) => ({
            id: n.id,
            timestamp: n.timestamp_seconds ?? n.timestamp ?? 0,
            content: n.note_text ?? n.content ?? '',
            created_at: n.created_at,
            episode_id: n.episode_id,
            episode_title: n.episodes?.title || 'حلقة غير محددة',
            episode_slug: n.episodes?.slug || n.episode_id,
          }));
          setCloudNotes(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCloudNotes();

    window.addEventListener('app_storage_updated', readLocalNotes);
    window.addEventListener('storage', readLocalNotes);

    return () => {
      window.removeEventListener('app_storage_updated', readLocalNotes);
      window.removeEventListener('storage', readLocalNotes);
    };
  }, [user]);

  // دمج الملاحظات المحلية مع السحابية دون تكرار
  const allNotes = useMemo(() => {
    const map = new Map<string, NormalizedNote>();
    
    // إضافة السحابية أولاً
    cloudNotes.forEach((n) => map.set(n.id, n));

    // إضافة أو دمج المحلية
    localNotes.forEach((n) => {
      if (!map.has(n.id)) {
        map.set(n.id, n);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [localNotes, cloudNotes]);

  // حذف الملاحظة وتحديث المتصفح والـ Navbar وسوبابيز فوراً
  const handleDelete = async (noteId: string) => {
    // 1. تحديث الحالة
    setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
    setCloudNotes((prev) => prev.filter((n) => n.id !== noteId));

    // 2. التحديث في السجل الموحد للمتصفح
    try {
      const raw = JSON.parse(localStorage.getItem('eh_el_moshkla_notes') || '[]');
      const filtered = raw.filter((n: any) => n.id !== noteId);
      localStorage.setItem('eh_el_moshkla_notes', JSON.stringify(filtered));
      window.dispatchEvent(new Event('app_storage_updated'));
    } catch (e) {}

    // 3. الحذف من سوبابيز إذا كان المستخدم مسجلاً
    if (user) {
      try {
        await supabase.from('notes').delete().eq('id', noteId);
      } catch (err) {}
    }
  };

  // تفريغ كل الملاحظات بنقرة واحدة
  const handleClearAll = () => {
    localStorage.setItem('eh_el_moshkla_notes', JSON.stringify([]));
    setLocalNotes([]);
    window.dispatchEvent(new Event('app_storage_updated'));
  };

  // تصدير ملف النسخة الاحتياطية
  const exportAllNotes = () => {
    if (allNotes.length === 0) return;
    const header = `سجل الفوائد والملاحظات الكامل | منصة بودكاست إيه المشكلة؟ وعالـمغرب\nتم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n======================================================\n\n`;
    
    const body = allNotes.map((n, i) => {
      return `${i + 1}. [${n.episode_title}] - توقيت: [${formatSeconds(n.timestamp)}]\nالفائدة: ${n.content}\n------------------------------------------------------`;
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span>دفتر الملاحظات والفوائد</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono font-bold border border-amber-400/20">
                {allNotes.length}
              </span>
              {user && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <Cloud className="w-3 h-3" />
                  مزامنة سحابية
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              جميع الفوائد والخواطر التي دوّنتها أثناء الاستماع للحلقات مرتبطة بتوقيتها بدقة.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {allNotes.length > 0 && (
              <>
                <button
                  onClick={exportAllNotes}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black transition-all shadow-lg active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير الملاحظات (Backup)</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors"
                  title="مسح كل الملاحظات المحلية"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
          </div>
        ) : allNotes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl mt-6">
            <Sparkles className="w-8 h-8 text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-300">لا توجد ملاحظات مدونة بعد</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              افتح أي حلقة، واكتب خواطرك واستفاداتك أثناء الاستماع لتجدها محفوظة هنا دائماً.
            </p>
            <Link
              href="/"
              className="mt-1 px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors"
            >
              استكشف الحلقات
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-6">
            {!user && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs gap-3">
                <span className="text-zinc-400">
                  يتم حفظ الملاحظات محلياً على هذا الجهاز. سجّل الدخول لحفظها ومزامنتها على كل أجهزتك.
                </span>
                <button
                  onClick={openAuthModal}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex-shrink-0"
                >
                  تسجيل الدخول
                </button>
              </div>
            )}

            {allNotes.map((note) => (
              <div
                key={note.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all text-right"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-amber-400">{note.episode_title}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      [{formatSeconds(note.timestamp)}]
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <Link
                    href={`/episodes/${note.episode_slug}?t=${note.timestamp}`}
                    className="p-2 px-3 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>الانتقال للدقيقة</span>
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
