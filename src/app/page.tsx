'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeCard from '@/components/EpisodeCard';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Search, X, Radio, Moon, 
  Sparkles, Layers, CheckCircle2, RotateCcw, AlertTriangle
} from 'lucide-react';

const TOPICS = [
  'الكل',
  'إيمانيات وتزكية',
  'علاقات وزواج',
  'تطوير وعادات',
  'معاملات وأموال',
  'شبهات وأسئلة'
];

function normalizeArabic(text: string): string {
  return (text || '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

export default function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'eh-el-moshkla' | 'ala-el-maghreb'>('all');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('الكل');

  const { setPlaylist } = usePlayerStore();

  const isUrlConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isKeyConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        if (!isUrlConfigured || !isKeyConfigured) {
          setSupabaseError('المتغيرات البيئية NEXT_PUBLIC_SUPABASE_URL أو ANON_KEY غير مقروءة في Vercel');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .order('season', { ascending: true })
          .order('episode_number', { ascending: true });

        if (error) {
          setSupabaseError(`خطأ من Supabase: ${error.message} (رمز: ${error.code || 'بدون كود'})`);
        } else if (data) {
          const sorted = [...data].sort((a: Episode, b: Episode) => {
            if (a.program !== b.program) {
              return a.program === 'eh-el-moshkla' ? -1 : 1;
            }
            if (Number(a.season) !== Number(b.season)) {
              return Number(a.season) - Number(b.season);
            }
            return Number(a.episode_number) - Number(b.episode_number);
          });

          setEpisodes(sorted);
          setPlaylist(sorted);
        }
      } catch (err: any) {
        setSupabaseError(`فشل الاتصال: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchEpisodes();
  }, [setPlaylist, isUrlConfigured, isKeyConfigured]);

  const availableSeasons = useMemo(() => {
    if (selectedProgram === 'eh-el-moshkla') return [1, 2, 3, 4, 5, 6];
    if (selectedProgram === 'ala-el-maghreb') return [1, 2, 3];
    return [1, 2, 3, 4, 5, 6];
  }, [selectedProgram]);

  const filteredEpisodes = useMemo(() => {
    const normSearch = normalizeArabic(searchQuery);

    return episodes.filter((ep) => {
      if (selectedProgram !== 'all' && ep.program !== selectedProgram) return false;
      if (selectedSeason !== 'all' && Number(ep.season) !== Number(selectedSeason)) return false;
      if (selectedTopic !== 'الكل' && ep.topic !== selectedTopic) return false;

      if (normSearch) {
        const titleNorm = normalizeArabic(ep.title);
        const topicNorm = normalizeArabic(ep.topic || '');
        const descNorm = normalizeArabic(ep.description || '');
        const epNumStr = ep.episode_number?.toString() || '';
        const seasonNumStr = ep.season?.toString() || '';

        const matchesTitle = titleNorm.includes(normSearch);
        const matchesTopic = topicNorm.includes(normSearch);
        const matchesDesc = descNorm.includes(normSearch);
        const matchesNumber = normSearch.includes(`حلقة ${epNumStr}`) || normSearch.includes(`موسم ${seasonNumStr}`);

        if (!matchesTitle && !matchesTopic && !matchesDesc && !matchesNumber) return false;
      }

      return true;
    });
  }, [episodes, searchQuery, selectedProgram, selectedSeason, selectedTopic]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProgram('all');
    setSelectedSeason('all');
    setSelectedTopic('الكل');
  };

  const isFiltered = searchQuery !== '' || selectedProgram !== 'all' || selectedSeason !== 'all' || selectedTopic !== 'الكل';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      {/* تنبيه الخطأ المباشر للتشخيص */}
      {supabaseError && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 px-4 py-3 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span><strong>تقرير الاتصال:</strong> {supabaseError}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 via-zinc-950 to-zinc-950 py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-slate-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>المكتبة الشاملة الموثقة • {episodes.length} حلقة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            بودكاست <span className="text-slate-300">إيه المشكلة؟</span> <br className="hidden sm:inline" />
            و <span className="text-amber-400">عالـمغرب</span>
          </h1>

          <p className="text-xs sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            استمع وشاهد جميع الحلقات والمواسم مرتبة زمنياً، مع تدوين لحظي للملاحظات وإمكانية الاستماع في الخلفية بدون مشتتات.
          </p>

          <div className="w-full max-w-2xl mt-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن حلقة، فكرة، موضوع، أو رقم موسم..."
                className="w-full bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-600 focus:border-slate-300 rounded-2xl py-3.5 pr-12 pl-10 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 shadow-2xl focus:outline-none transition-all backdrop-blur-md"
              />
              <Search className="w-5 h-5 text-zinc-400 absolute right-4 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* شريط الفلاتر وعرض الحلقات */}
      <section id="series" className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8 flex flex-col gap-6">
        
        <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-bold text-zinc-300">السلسلة:</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80">
              <button
                onClick={() => { setSelectedProgram('all'); setSelectedSeason('all'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedProgram === 'all'
                    ? 'bg-zinc-100 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                جميع الحلقات ({episodes.length})
              </button>

              <button
                onClick={() => { setSelectedProgram('eh-el-moshkla'); setSelectedSeason('all'); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedProgram === 'eh-el-moshkla'
                    ? 'bg-zinc-100 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>إيه المشكلة</span>
              </button>

              <button
                onClick={() => { setSelectedProgram('ala-el-maghreb'); setSelectedSeason('all'); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedProgram === 'ala-el-maghreb'
                    ? 'bg-amber-400 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-amber-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>عالـمغرب</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 ml-2">الموسم:</span>
            <button
              onClick={() => setSelectedSeason('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedSeason === 'all'
                  ? 'bg-white text-zinc-950 border-white'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              كل المواسم
            </button>

            {availableSeasons.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedSeason === s
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {selectedProgram === 'ala-el-maghreb' ? `عالـمغرب ${s}` : `الموسم ${s}`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
            <span className="text-xs font-bold text-zinc-400 ml-2">الموضوع:</span>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  selectedTopic === topic
                    ? 'bg-slate-200 text-zinc-950 border-slate-200 shadow-sm'
                    : 'bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>عرض <strong className="text-white font-mono">{filteredEpisodes.length}</strong> حلقة</span>
            {isFiltered && <span className="text-zinc-500">(مفلترة من أصل {episodes.length})</span>}
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الفلاتر</span>
            </button>
          )}
        </div>

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
            <Search className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">لم يتم العثور على أي حلقة</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              {supabaseError ? 'يوجد خطأ في الاتصال بقاعدة البيانات، راجع التنبيه بالأعلى' : 'جرّب إعادة تعيين الفلاتر أو تغيير كلمة البحث'}
            </p>
          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
