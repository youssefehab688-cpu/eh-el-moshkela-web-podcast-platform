'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeCard from '@/components/EpisodeCard';
import { usePlayerStore } from '@/store/usePlayerStore';
import { DAILY_QUOTES, QuoteItem } from '@/data/quotes';
import { 
  Search, X, Radio, Moon, 
  Layers, CheckCircle2, RotateCcw, Play, Headphones, 
  Sparkles, ArrowDown, Clock, History, Compass, Quote, Copy, Check
} from 'lucide-react';

const CURATED_PATHS = [
  { id: 'path-faith', title: 'مسار التوبة وترويض النفس', icon: '🌱' },
  { id: 'path-marriage', title: 'مسار العلاقات واختيار الشريك', icon: '💍' },
  { id: 'path-prayer', title: 'مسار الخشوع والراحة في الصلاة', icon: '🕌' },
];

const TRACK_KEYWORDS: Record<string, string[]> = {
  'path-faith': [
    'توبة', 'توبه', 'تائب', 'ذنب', 'ذنوب', 'معصية', 'معاصي', 'معصيه',
    'انتكاس', 'انتكاسة', 'انتكاسه', 'شهوة', 'شهوات', 'شهوه', 'ترويض',
    'نفس', 'هوى', 'استغفار', 'هداية', 'هدايه', 'تغيير', 'قلب'
  ],
  'path-marriage': [
    'زواج', 'جواز', 'شريك', 'علاقة', 'علاقات', 'علاقه', 'خطوبة', 'خطوبه',
    'حب', 'ارتباط', 'انفصال', 'طلاق', 'اختيار', 'اهل', 'صحاب', 'صداقة',
    'صداقه', 'بنات', 'مشاعر', 'تفاهم', 'بيوت', 'بيت'
  ],
  'path-prayer': [
    'صلاة', 'صلاه', 'بصلي', 'بصليش', 'اصلي', 'خشوع', 'فجر', 'قيام',
    'ركوع', 'سجود', 'مسجد', 'وضوء', 'تارك'
  ],
};

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

function formatMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'eh-el-moshkla' | 'ala-el-maghreb'>('all');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  const [copiedQuote, setCopiedQuote] = useState(false);
  const [todayQuote, setTodayQuote] = useState<QuoteItem>(DAILY_QUOTES[0]);

  const [lastPlayed, setLastPlayed] = useState<{
    episode: Episode;
    currentTime: number;
    duration: number;
  } | null>(null);

  const { setPlaylist, playEpisode } = usePlayerStore();

  // تحديث حالة آخر حلقة تم الاستماع إليها فورياً
  const refreshLastPlayed = () => {
    try {
      const saved = localStorage.getItem('eh_el_moshkla_last_played');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.episode && parsed?.currentTime > 2) {
          setLastPlayed(parsed);
          return;
        }
      }
      setLastPlayed(null);
    } catch (e) {
      setLastPlayed(null);
    }
  };

  useEffect(() => {
    const day = new Date().getDate();
    setTodayQuote(DAILY_QUOTES[day % DAILY_QUOTES.length]);

    refreshLastPlayed();

    // الاستماع للتحديثات اللحظية لظهور شريط استئناف الاستماع فوراً عند إغلاق المشغل
    window.addEventListener('app_storage_updated', refreshLastPlayed);
    window.addEventListener('storage', refreshLastPlayed);

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

    return () => {
      window.removeEventListener('app_storage_updated', refreshLastPlayed);
      window.removeEventListener('storage', refreshLastPlayed);
    };
  }, [setPlaylist]);

  // استخراج أحدث حلقة نازلة فعلياً (أعلى موسم وأعلى رقم حلقة في إيه المشكلة)
  const latestEpisode = useMemo(() => {
    if (!episodes.length) return null;
    const ehEpisodes = episodes.filter((ep) => ep.program === 'eh-el-moshkla');
    const pool = ehEpisodes.length > 0 ? ehEpisodes : episodes;
    
    return [...pool].sort((a, b) => {
      if (Number(b.season) !== Number(a.season)) {
        return Number(b.season) - Number(a.season);
      }
      return Number(b.episode_number) - Number(a.episode_number);
    })[0];
  }, [episodes]);

  const handleCopyQuote = () => {
    const textToCopy = `«${todayQuote.quote}»\n— ${todayQuote.author} (بودكاست إيه المشكلة وعالـمغرب)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleToggleTrack = (trackId: string) => {
    setActiveTrack((prev) => (prev === trackId ? null : trackId));
  };

  const filteredEpisodes = useMemo(() => {
    const normSearch = normalizeArabic(searchQuery);

    return episodes.filter((ep) => {
      if (selectedProgram !== 'all' && ep.program !== selectedProgram) return false;
      if (selectedSeason !== 'all' && Number(ep.season) !== Number(selectedSeason)) return false;

      if (activeTrack && TRACK_KEYWORDS[activeTrack]) {
        const combined = normalizeArabic(`${ep.title} ${ep.description || ''} ${ep.topic || ''}`);
        const keywords = TRACK_KEYWORDS[activeTrack].map(normalizeArabic);
        const matchesTrack = keywords.some((kw) => combined.includes(kw));
        if (!matchesTrack) return false;
      }

      if (normSearch) {
        const titleNorm = normalizeArabic(ep.title);
        const descNorm = normalizeArabic(ep.description || '');
        const epNumStr = ep.episode_number?.toString() || '';
        const seasonNumStr = ep.season?.toString() || '';

        const matchesTitle = titleNorm.includes(normSearch);
        const matchesDesc = descNorm.includes(normSearch);
        const matchesNumber = normSearch.includes(`حلقة ${epNumStr}`) || normSearch.includes(`موسم ${seasonNumStr}`);

        if (!matchesTitle && !matchesDesc && !matchesNumber) return false;
      }

      return true;
    });
  }, [episodes, searchQuery, selectedProgram, selectedSeason, activeTrack]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProgram('all');
    setSelectedSeason('all');
    setActiveTrack(null);
  };

  const resumePlayback = () => {
    if (lastPlayed) {
      const epWithSeek = {
        ...lastPlayed.episode,
        initialSeekTime: lastPlayed.currentTime,
      };
      playEpisode(epWithSeek, 'video');
    }
  };

  const isFiltered = searchQuery !== '' || selectedProgram !== 'all' || selectedSeason !== 'all' || activeTrack !== null;

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      {/* الهيرو السينمائي الأصلي: تعتيم جهة النصوص يميناً وإضاءة ساطعة لملامح الاستوديو يساراً */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[82vh] flex items-center justify-start overflow-hidden border-b border-zinc-800/80 pt-24 pb-14 px-5 sm:px-12 lg:px-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-banner.jpg"
            alt="بودكاست إيه المشكلة"
            onError={(e) => {
              if (latestEpisode?.youtube_video_id) {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${latestEpisode.youtube_video_id}/maxresdefault.jpg`;
              }
            }}
            className="h-full w-full object-cover object-center filter brightness-[0.82] contrast-[1.08] transition-transform duration-1000"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07080b]/60 to-[#07080b]/95" />
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-start text-right gap-4 sm:gap-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-950/70 border border-white/15 text-[11px] font-bold text-zinc-300 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>بودكاست إيه المشكلة؟ وعالـمغرب</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-normal sm:leading-relaxed drop-shadow-2xl">
            مساحات لفهم النفس والواقع
            <span className="block mt-3 sm:mt-4 pt-1 text-zinc-100">
              وإصلاح ما بيننا وبين الله
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed font-normal drop-shadow">
            د. محمد الغليظ، د. أمير منير، وم. ياسر ممدوح يطرحون أسئلة الشباب الملحة في الدين، العلاقات، وتحديات الحياة المعاصرة برؤية عملية هادئة.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {latestEpisode && (
              <button
                onClick={() => playEpisode(latestEpisode, 'video')}
                className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-xl active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                  <span>استمع لأحدث حلقة</span>
              </button>
            )}

            <a
              href="#series"
              className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>تصفح كل المواسم</span>
            </a>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-white/10 w-full max-w-md">
            <div className="flex items-center gap-2 text-zinc-300">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white font-mono">{episodes.length || 161}</span>
              <span className="text-[11px] text-zinc-400">حلقة</span>
            </div>

            <div className="h-3 w-px bg-white/20" />

            <div className="flex items-center gap-2 text-zinc-300">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs sm:text-sm font-black text-white font-mono">6 + 3</span>
              <span className="text-[11px] text-zinc-400">مواسم</span>
            </div>
          </div>
        </div>
      </section>

      {/* استئناف الاستماع (يظهر لحظياً فور إغلاق أو مغادرة المشغل) */}
      {lastPlayed && (
        <section className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 -mt-6 sm:-mt-8 relative z-20 animate-card-fade">
          <div className="rounded-3xl border border-amber-500/30 bg-zinc-900/90 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-amber-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative h-14 w-24 sm:h-16 sm:w-28 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                <img
                  src={`https://img.youtube.com/vi/${lastPlayed.episode.youtube_video_id}/mqdefault.jpg`}
                  alt={lastPlayed.episode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  أكمل من حيث توقفت
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-sm sm:max-w-md">
                  {lastPlayed.episode.title}
                </h4>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  توقفت عند الدقيقة {formatMinutes(lastPlayed.currentTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={resumePlayback}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 w-full md:w-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>متابعة الاستماع</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('eh_el_moshkla_last_played');
                  setLastPlayed(null);
                  window.dispatchEvent(new Event('app_storage_updated'));
                }}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="إخفاء"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* قسم فائدة اليوم */}
      <section className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 pt-6">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-900/60 via-zinc-900/80 to-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
          <div className="flex items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex-shrink-0 mt-1 sm:mt-0">
              <Quote className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-amber-400">فائدة اليوم</span>
              <p suppressHydrationWarning className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed mt-1">
                «{todayQuote.quote}»
              </p>
              <span suppressHydrationWarning className="text-[11px] text-zinc-500 font-bold mt-0.5">
                — {todayQuote.author}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handleCopyQuote}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700"
            >
              {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedQuote ? 'تم النسخ!' : 'نسخ الفائدة'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* المسارات الموجهة الذكية */}
      <section className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 pt-6">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              مسارات استماع موجهة لمشكلات محددة:
            </h3>
          </div>
          {activeTrack && (
            <button
              onClick={() => setActiveTrack(null)}
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              إلغاء تصفية المسار ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CURATED_PATHS.map((path) => {
            const isActive = activeTrack === path.id;
            return (
              <button
                key={path.id}
                onClick={() => handleToggleTrack(path.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-right group active:scale-95 ${
                  isActive
                    ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50'
                    : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/80 hover:border-amber-400/40'
                }`}
              >
                <span className={`text-2xl p-2 rounded-xl border flex-shrink-0 transition-colors ${
                  isActive ? 'bg-amber-400/20 border-amber-400/40' : 'bg-zinc-950/60 border-zinc-800'
                }`}>
                  {path.icon}
                </span>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold transition-colors ${isActive ? 'text-amber-400 font-black' : 'text-white group-hover:text-amber-400'}`}>
                    {path.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    {isActive ? '✓ المسار مفعّل الآن (اضغط للإلغاء)' : 'اضغط لعرض كل حلقات المسار'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* الفهرسة والبحث وشبكة الحلقات */}
      <section id="series" className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 pt-8 flex flex-col gap-6">
        
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن حلقة، فكرة، أو رقم موسم..."
              className="w-full bg-zinc-900/80 border border-zinc-700/80 hover:border-zinc-500 focus:border-amber-400/90 rounded-2xl py-3.5 pr-11 pl-11 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 shadow-xl focus:outline-none transition-all duration-300 backdrop-blur-xl"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 pointer-events-none group-focus-within:text-amber-400 transition-colors" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">تصفح البرامج والمواسم:</span>
            </div>

            <button
              onClick={() => { setSelectedProgram('all'); setSelectedSeason('all'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedProgram === 'all' && selectedSeason === 'all'
                  ? 'bg-white text-zinc-950 font-black shadow'
                  : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              جميع حلقات البرنامجين ({episodes.length})
            </button>
          </div>

          {/* الصف الأول: بودكاست إيه المشكلة؟ */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 min-w-[130px]">
              <Radio className="w-3.5 h-3.5" />
              <span>إيه المشكلة؟:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedProgram('eh-el-moshkla');
                  setSelectedSeason('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedProgram === 'eh-el-moshkla' && selectedSeason === 'all'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-md'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                كل مواسم البرنامج
              </button>

              {[1, 2, 3, 4, 5, 6].map((s) => (
                <button
                  key={`eh-${s}`}
                  onClick={() => {
                    if (selectedProgram === 'eh-el-moshkla' && selectedSeason === s) {
                      setSelectedProgram('all');
                      setSelectedSeason('all');
                    } else {
                      setSelectedProgram('eh-el-moshkla');
                      setSelectedSeason(s);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                    selectedProgram === 'eh-el-moshkla' && selectedSeason === s
                      ? 'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-md'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  الموسم {s}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-800/60 w-full" />

          {/* الصف الثاني: برنامج عالـمغرب */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 min-w-[130px]">
              <Moon className="w-3.5 h-3.5" />
              <span>عالـمغرب:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedProgram('ala-el-maghreb');
                  setSelectedSeason('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedProgram === 'ala-el-maghreb' && selectedSeason === 'all'
                    ? 'bg-sky-400 text-zinc-950 border-sky-400 font-black shadow-md'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                كل مواسم عالـمغرب
              </button>

              {[1, 2, 3].map((s) => (
                <button
                  key={`maghreb-${s}`}
                  onClick={() => {
                    if (selectedProgram === 'ala-el-maghreb' && selectedSeason === s) {
                      setSelectedProgram('all');
                      setSelectedSeason('all');
                    } else {
                      setSelectedProgram('ala-el-maghreb');
                      setSelectedSeason(s);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                    selectedProgram === 'ala-el-maghreb' && selectedSeason === s
                      ? 'bg-sky-400 text-zinc-950 border-sky-400 font-black shadow-md'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  الموسم {s}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
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
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
          </div>
        ) : filteredEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredEpisodes.map((episode, idx) => (
              <EpisodeCard key={episode.id} episode={episode} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl gap-3">
            <Search className="w-10 h-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">لم يتم العثور على أي حلقة</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              جرّب الضغط على زر "إعادة تعيين الفلاتر" أعلاه أو كتابة كلمة بحث أخرى.
            </p>
          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
