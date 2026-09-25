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
  Sparkles, Layers, CheckCircle2, RotateCcw, Play, Headphones
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'eh-el-moshkla' | 'ala-el-maghreb'>('all');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('الكل');

  const { setPlaylist } = usePlayerStore();

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .order('season', { ascending: true })
          .order('episode_number', { ascending: true });

        if (!error && data) {
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
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEpisodes();
  }, [setPlaylist]);

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
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      {/* Hero Section السينمائي مع إضاءة استوديو محيطية */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6">
        
        {/* هالات الإضاءة السينمائية في الخلفية (Ambient Studio Lighting) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          {/* إضاءة كهرمانية ذهبية من اليمين تحاكي إضاءة الاستوديو الدافئة */}
          <div className="absolute -top-32 right-10 sm:right-1/4 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
          {/* إضاءة رمادية باردة من اليسار لخلق التباين السينمائي */}
          <div className="absolute -top-32 left-10 sm:left-1/4 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-slate-500/10 rounded-full blur-[150px] pointer-events-none" />
          {/* شبكة ناعمة خافتة تُضفي عمقاً ثلاثي الأبعاد */}
          <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10 flex flex-col items-center gap-6">
          
          {/* الشارة العلوية */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-xs font-bold text-zinc-300 shadow-2xl backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>المكتبة الصوتية والمرئية الشاملة • {episodes.length || 161} حلقة موثقة</span>
          </div>

          {/* العنوان الرئيسي بخط سينمائي وتدرج ضوئي فخم */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15]">
            بودكاست <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400">إيه المشكلة؟</span> <br />
            و <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">عالـمغرب</span>
          </h1>

          <p className="text-xs sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-normal">
            المكان الأنسب للاستماع الواعي وتدوين الفوائد؛ جميع المواسم مرتبة زمنياً ومفهرسة موضوعياً لتجربة استماع خالية من أي مشتتات.
          </p>

          {/* شريط البحث الزجاجي السينمائي */}
          <div className="w-full max-w-2xl mt-3">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن حلقة، فكرة، موضوع، أو رقم موسم..."
                className="w-full bg-zinc-900/70 border border-zinc-700/70 hover:border-zinc-500 focus:border-amber-400/80 rounded-2xl py-4 pr-12 pl-12 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 shadow-2xl shadow-black/80 focus:outline-none transition-all duration-300 backdrop-blur-xl group-hover:bg-zinc-900/90"
              />
              <Search className="w-5 h-5 text-zinc-400 absolute right-4 pointer-events-none group-focus-within:text-amber-400 transition-colors" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* شريط الفلاتر وعرض الحلقات المتجاوب بالكامل */}
      <section id="series" className="container mx-auto max-w-7xl px-4 sm:px-6 pt-10 flex flex-col gap-6">
        
        {/* صندوق التصفية الذكي */}
        <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">السلسلة:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80">
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
                    ? 'bg-amber-400 text-zinc-950 shadow font-black'
                    : 'text-zinc-400 hover:text-amber-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>عالـمغرب</span>
              </button>
            </div>
          </div>

          {/* فلاتر المواسم */}
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

          {/* فلاتر الموضوعات */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
            <span className="text-xs font-bold text-zinc-400 ml-2">الموضوع:</span>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  selectedTopic === topic
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm font-bold'
                    : 'bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* شريط الإحصائية وإعادة التعيين */}
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

        {/* شبكة الحلقات المتجاوبة: 1 للموبايل - 2 أو 3 للتابلت - 4 للكمبيوتر */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
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
              جرّب إعادة تعيين الفلاتر أو كتابة كلمة بحث أخرى.
            </p>
          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
