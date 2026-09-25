'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { usePlayerStore } from '@/store/usePlayerStore';
import { DAILY_QUOTES, QuoteItem } from '@/data/quotes';
import { Episode } from '@/types';
import { toPng } from 'html-to-image';
import { Quote, Play, Share2, Download, Sparkles, Filter } from 'lucide-react';

const AUTHORS = ['الكل', 'د. محمد الغليظ', 'د. أمير منير', 'م. ياسر ممدوح'];

export default function QuotesPage() {
  const [selectedAuthor, setSelectedAuthor] = useState('الكل');
  const [activeCardQuote, setActiveCardQuote] = useState<QuoteItem | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { playEpisode } = usePlayerStore();

  const filteredQuotes = selectedAuthor === 'الكل'
    ? DAILY_QUOTES
    : DAILY_QUOTES.filter((q) => q.author === selectedAuthor);

  const handlePlayQuote = (quoteItem: QuoteItem) => {
    const epToPlay: Episode = {
      id: quoteItem.youtubeId,
      title: quoteItem.titleHint,
      youtube_video_id: quoteItem.youtubeId,
      season: 1,
      episode_number: 1,
      program: 'eh-el-moshkla',
      initialSeekTime: quoteItem.seekSeconds,
    } as any;

    playEpisode(epToPlay, 'video');
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `فائدة-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setActiveCardQuote(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      {/* مودال توليد كارت الاقتباس للمشاركة */}
      {activeCardQuote && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <div
              ref={cardRef}
              className="w-full aspect-square bg-[#0b0c10] border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between text-right relative overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider">إيه المشكلة؟ وعالـمغرب</span>
                <span className="text-[10px] text-zinc-500 font-mono">[{activeCardQuote.timeFormatted}]</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-white leading-relaxed my-auto">
                «{activeCardQuote.quote}»
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400">— {activeCardQuote.author}</span>
                <span className="text-[10px] font-black text-zinc-500">ehelmoshkla.app</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={downloadCard}
                disabled={isGenerating}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'جاري التحميل...' : 'حفظ الصورة'}</span>
              </button>
              <button
                onClick={() => setActiveCardQuote(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8 pt-24">
        <div className="flex flex-col gap-2 pb-6 border-b border-zinc-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>بنك الفوائد والاقتباسات الموثقة</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            جواهر الكلمات من حلقات البودكاست
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            اقتباسات منتقاة بعناية مربوطة بالثانية الدقيقة داخل الحلقة، لتستمع للمعنى في سياقه الأصلي فوراً أو تشاركه ككارت أنيق.
          </p>
        </div>

        {/* فلاتر المتحدث */}
        <div className="flex items-center gap-2 py-6 overflow-x-auto">
          <Filter className="w-4 h-4 text-zinc-500 ml-1 flex-shrink-0" />
          {AUTHORS.map((author) => (
            <button
              key={author}
              onClick={() => setSelectedAuthor(author)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 border ${
                selectedAuthor === author
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {author}
            </button>
          ))}
        </div>

        {/* شبكة الاقتباسات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredQuotes.map((q) => (
            <div
              key={q.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-400/40 transition-all text-right group shadow-lg gap-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-400">{q.author}</span>
                  <span className="font-mono text-zinc-500">[{q.timeFormatted}]</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                  «{q.quote}»
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 truncate">{q.titleHint}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayQuote(q)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition-all shadow active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استمع للمقطع</span>
                  </button>

                  <button
                    onClick={() => setActiveCardQuote(q)}
                    title="تحويل لصورة للمشاركة"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Player />
    </main>
  );
}
