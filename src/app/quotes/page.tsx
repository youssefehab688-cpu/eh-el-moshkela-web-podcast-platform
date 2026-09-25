'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { DAILY_QUOTES, QuoteItem } from '@/data/quotes';
import { toPng } from 'html-to-image';
import { Share2, Download, Sparkles, Filter, Copy, Check } from 'lucide-react';

const AUTHORS = ['الكل', 'د. محمد الغليظ', 'د. أمير منير', 'م. ياسر ممدوح'];

export default function QuotesPage() {
  const [selectedAuthor, setSelectedAuthor] = useState('الكل');
  const [activeCardQuote, setActiveCardQuote] = useState<QuoteItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredQuotes = selectedAuthor === 'الكل'
    ? DAILY_QUOTES
    : DAILY_QUOTES.filter((q) => q.author === selectedAuthor);

  const handleCopy = (quoteItem: QuoteItem) => {
    const text = `«${quoteItem.quote}»\n— ${quoteItem.author}`;
    navigator.clipboard.writeText(text);
    setCopiedId(quoteItem.id);
    setTimeout(() => setCopiedId(null), 2000);
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

      {activeCardQuote && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <div
              ref={cardRef}
              className="w-full aspect-square bg-[#0b0c10] border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between text-right relative overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider">إيه المشكلة؟ وعالـمغرب</span>
                <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">{activeCardQuote.topic}</span>
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
            <span>بنك الفوائد والاقتباسات</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            جواهر الكلمات والمعاني
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            مجموعة منتقاة من الفوائد التربوية والفكرية من حلقات البودكاست لمشاركتها كصور أو نصوص.
          </p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredQuotes.map((q) => (
            <div
              key={q.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-400/40 transition-all text-right group shadow-lg gap-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-400">{q.author}</span>
                  <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800">{q.topic}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                  «{q.quote}»
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                <button
                  onClick={() => handleCopy(q)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === q.id ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>

                <button
                  onClick={() => setActiveCardQuote(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-bold transition-colors border border-amber-400/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة كصورة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Player />
    </main>
  );
}
