'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { toPng } from 'html-to-image';
import { 
  ArrowRight, Bookmark, Share2, BookOpen, 
  Clock, Download, Maximize, Minimize, Plus, Trash2, 
  BookMarked, ExternalLink, Link2, Check
} from 'lucide-react';

interface NoteItem {
  id: string;
  timestamp_seconds: number;
  content: string;
  created_at: string;
}

interface BookResource {
  title: string;
  author: string;
  note: string;
  link?: string;
}

function getCuratedBooks(topic: string, title: string): BookResource[] {
  const normTitle = (title || '').toLowerCase();
  
  if (normTitle.includes('صلاة') || normTitle.includes('خشوع')) {
    return [
      { title: 'ذوق الصلاة عند ابن القيم', author: 'ابن قيم الجوزية / عادل عبد الشكور', note: 'شرح معاني حركات الصلاة والتلذذ بمناجاة الله.', link: 'https://www.goodreads.com' },
      { title: 'أول مرة أصلي وكان للصلاة طعم آخر', author: 'د. خالد أبو شادي', note: 'دليل عملي لإحياء القلب أثناء أداء الفرائض.', link: 'https://www.goodreads.com' }
    ];
  }
  
  if (normTitle.includes('توبة') || normTitle.includes('ذنب') || normTitle.includes('فتور')) {
    return [
      { title: 'الداء والدواء (الجواب الكافي)', author: 'ابن قيم الجوزية', note: 'أقوى تشخيص لأمراض القلوب وخطوات الخلاص من المعاصي والتعلق.', link: 'https://www.goodreads.com' },
      { title: 'مدارج السالكين بين منازل إياك نعبد وإياك نستعين', author: 'ابن قيم الجوزية', note: 'مرجع أساسي في ترويض النفس ومنازل السير إلى الله.', link: 'https://www.goodreads.com' }
    ];
  }

  if (normTitle.includes('زواج') || normTitle.includes('حب') || normTitle.includes('ارتباط')) {
    return [
      { title: 'سنة أولى زواج', author: 'د. جاسم المطوع', note: 'إرشادات عملية لفهم الفروق النفسية وبناء تواصل متزن في بداية الطريق.', link: 'https://www.goodreads.com' },
      { title: 'حتى يبقى الحب', author: 'د. محمد محمد بدري', note: 'توجيهات نفسية واجتماعية للحفاظ على المودة داخل البيت المسلم.', link: 'https://www.goodreads.com' }
    ];
  }

  return [
    { title: 'رسالة في التزكية', author: 'ابن تيمية', note: 'بيان حقيقة طهارة النفس وأثر التوحيد في صلاح القلب.', link: 'https://www.goodreads.com' },
    { title: 'صيد الخاطر', author: 'ابن الجوزي', note: 'خواطر وتأملات راقية في فهم طبائع النفس وتجارب الحياة الواقعية.', link: 'https://www.goodreads.com' }
  ];
}

function formatSeconds(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function EpisodeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuthStore();
  const { playEpisode } = usePlayerStore();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(0);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [activeCardNote, setActiveCardNote] = useState<NoteItem | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const rawSlug = params?.slug as string;

  useEffect(() => {
    async function loadEpisodeData() {
      if (!rawSlug) return;

      const cleanSlug = decodeURIComponent(rawSlug).trim();
      const timeFromUrl = searchParams.get('t');
      if (timeFromUrl) {
        setNoteTimestamp(parseInt(timeFromUrl, 10) || 0);
      } else {
        const seekTarget = localStorage.getItem('eh_el_moshkla_seek_target');
        if (seekTarget) {
          setNoteTimestamp(Math.floor(parseFloat(seekTarget)));
          localStorage.removeItem('eh_el_moshkla_seek_target');
        }
      }

      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

        let query = supabase.from('episodes').select('*');
        if (isUuid) {
          query = query.or(`id.eq.${cleanSlug},slug.eq.${cleanSlug},youtube_video_id.eq.${cleanSlug}`);
        } else {
          query = query.or(`slug.eq.${cleanSlug},youtube_video_id.eq.${cleanSlug}`);
        }

        let { data, error } = await query.maybeSingle();

        // حل احتياطي ذكي: إذا لم يعثر عليه بالرمز الدقيق، يبحث برقم الحلقة أو العنوان
        if (!data) {
          const { data: fallback } = await supabase
            .from('episodes')
            .select('*')
            .ilike('title', `%${cleanSlug}%`)
            .limit(1)
            .maybeSingle();

          data = fallback;
        }

        if (data) {
          setEpisode(data);
        }
      } catch (err) {
        console.error('Error loading episode:', err);
      } finally {
        setLoading(false);
      }
    }

    loadEpisodeData();
  }, [rawSlug, searchParams]);

  useEffect(() => {
    async function fetchUserData() {
      if (!user || !episode) return;

      const { data: bData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .maybeSingle();

      setIsBookmarked(!!bData);

      const { data: nData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .order('timestamp_seconds', { ascending: true });

      if (nData) setNotes(nData);
    }

    fetchUserData();
  }, [user, episode]);

  const toggleBookmark = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!episode) return;

    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('episode_id', episode.id);
      setIsBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, episode_id: episode.id });
      setIsBookmarked(true);
    }
  };

  const copyTimestampLink = () => {
    if (!episode) return;
    const url = `${window.location.origin}/episodes/${episode.slug || episode.youtube_video_id}?t=${noteTimestamp}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newNoteContent.trim() || !episode) return;

    setIsSavingNote(true);
    const newNote = {
      user_id: user.id,
      episode_id: episode.id,
      timestamp_seconds: noteTimestamp,
      content: newNoteContent.trim(),
    };

    const { data, error } = await supabase.from('notes').insert(newNote).select().single();
    if (!error && data) {
      setNotes((prev) => [...prev, data].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      setNewNoteContent('');
    }
    setIsSavingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const exportNotesAsText = () => {
    if (!episode || notes.length === 0) return;
    const header = `فوائد وملاحظات حلقة: ${episode.title}\nالموسم ${episode.season} | بودكاست إيه المشكلة؟ وعالـمغرب\n----------------------------------------\n\n`;
    const body = notes
      .map((n) => `[${formatSeconds(n.timestamp_seconds)}] ${n.content}`)
      .join('\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `فوائد-${episode.title.slice(0, 30)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCardImage = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `فائدة-ايه-المشكلة-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsGeneratingImage(false);
      setActiveCardNote(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#07080b] flex flex-col items-center justify-center text-center px-4 gap-3">
        <h2 className="text-xl font-bold text-white">لم نتمكن من العثور على الحلقة المطلوبة</h2>
        <p className="text-xs text-zinc-400">ربما تم تغيير الرابط أو تم الوصول عبر بحث غير دقيق.</p>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 rounded-full bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200">العودة للرئيسية</button>
      </div>
    );
  }

  const books = getCuratedBooks(episode.topic || '', episode.title);

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      {!focusMode && <Navbar />}

      {/* مودال توليد كارت المشاركة */}
      {activeCardNote && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <div
              ref={cardRef}
              className="w-full aspect-square bg-[#0b0c10] border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between text-right relative overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider">إيه المشكلة؟ وعالـمغرب</span>
                <span className="text-[10px] text-zinc-500 font-mono">[{formatSeconds(activeCardNote.timestamp_seconds)}]</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-white leading-relaxed my-auto">
                «{activeCardNote.content}»
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 truncate max-w-[200px]">{episode.title}</span>
                <span className="text-[10px] font-black text-amber-400">ehelmoshkla.app</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={downloadCardImage}
                disabled={isGeneratingImage}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'جاري التحميل...' : 'حفظ الصورة'}</span>
              </button>
              <button
                onClick={() => setActiveCardNote(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`mx-auto w-full ${focusMode ? 'max-w-5xl pt-6' : 'max-w-7xl pt-24'} px-4 sm:px-8 transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكل الحلقات</span>
          </button>

          <div className="flex items-center gap-2">
            {/* زر مشاركة اللحظة بالدقيقة */}
            <button
              onClick={copyTimestampLink}
              title="مشاركة رابط يبدأ من الدقيقة المحددة"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-300 hover:text-amber-400 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم نسخ الرابط بالدقيقة!' : 'مشاركة هذه الدقيقة'}</span>
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              {focusMode ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              <span>{focusMode ? 'إلغاء التركيز' : 'وضع التركيز'}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full border transition-colors ${
                isBookmarked
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="حفظ الحلقة"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* عرض الفيديو مع بدء التشغيل التلقائي من الدقيقة المحددة إن وجدت */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-black mb-6">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${episode.youtube_video_id}?autoplay=1&rel=0&start=${noteTimestamp}`}
            title={episode.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-amber-400">
                <span>{episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟'}</span>
                <span>•</span>
                <span>الموسم {episode.season}</span>
                {episode.topic && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">{episode.topic}</span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug">
                {episode.title}
              </h1>
            </div>

            {episode.description && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                {episode.description}
              </p>
            )}

            {/* قسم الكتب والتوصيات */}
            <div className="flex flex-col gap-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">كتب وتوصيات أشار إليها المقدمون في هذا السياق:</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {books.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white line-clamp-1">{b.title}</span>
                        {b.link && (
                          <a
                            href={b.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-amber-400 transition-colors"
                            title="عرض في GoodReads"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium block mt-0.5">{b.author}</span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-2">{b.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* صندوق تدوين الفوائد */}
          <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">فوائد وملاحظات الحلقة</h3>
              </div>
              {notes.length > 0 && (
                <button
                  onClick={exportNotesAsText}
                  title="تصدير الملاحظات لملف نصي"
                  className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير</span>
                </button>
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex flex-col gap-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="اكتب فائدة أو معنى استوقفك في هذه الدقيقة..."
                rows={3}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>التوقيت:</span>
                  <input
                    type="number"
                    min={0}
                    value={noteTimestamp}
                    onChange={(e) => setNoteTimestamp(Number(e.target.value))}
                    className="w-14 bg-zinc-950 border border-zinc-800 rounded px-1 text-center text-white"
                  />
                  <span>ث</span>
                </div>
                <button
                  type="submit"
                  disabled={isSavingNote || !newNoteContent.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black transition-all disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>حفظ الفائدة</span>
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  لم تدوّن أي فائدة لهذه الحلقة بعد.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-right group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-mono text-amber-400/90 font-bold">
                        [{formatSeconds(note.timestamp_seconds)}]
                      </span>
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActiveCardNote(note)}
                          title="تحويل لصورة ومشاركتها"
                          className="p-1 hover:text-amber-400 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="حذف"
                          className="p-1 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Player />
    </main>
  );
}
