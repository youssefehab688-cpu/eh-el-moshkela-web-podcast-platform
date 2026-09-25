'use client';

import { Play, Layers, Compass, Radio } from 'lucide-react';

interface HeroProps {
  totalEpisodes: number;
}

export default function Hero({ totalEpisodes }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent" />
      <div className="absolute inset-0 z-10 bg-radial-gradient from-slate-400/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-20 container mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-14 md:pt-24 md:pb-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 text-xs font-semibold mb-6 backdrop-blur-md shadow-lg shadow-black/40">
          <span className="h-2 w-2 rounded-full bg-slate-300 animate-ping"></span>
          <span>المكتبة الشاملة لجميع الجلسات والخواطر الرمضانية</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight sm:leading-tight mb-4">
          مساحات نتأمل فيها <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-400">الدين والحياة</span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl font-normal mb-8 leading-relaxed">
          د. أمير منير، د. ياسر ممدوح، ود. محمد الغليظ في حوارات بودكاست إيه المشكلة، وخواطر برنامج عالـمغرب الرمضاني.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <a
            href="#series"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-zinc-100 to-slate-200 hover:from-white hover:to-slate-100 text-zinc-950 font-extrabold text-sm sm:text-base shadow-xl shadow-white/5 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>تصفح واستمع للحلقات</span>
          </a>
        </div>

        {/* شريط الإحصائيات مع تنسيق 6 + 3 الواضح */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-lg bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-2xl">
          
          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm font-semibold mb-1">
              <Radio className="w-3.5 h-3.5 text-slate-300" />
              <span>إجمالي الحلقات</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">
              {totalEpisodes > 0 ? `+${totalEpisodes}` : '+150'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm font-semibold mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>مواسم البرامج</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">6</span>
              <span className="text-xs text-zinc-500 font-bold">+</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">3</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">
              (6 بودكاست + 3 رمضانية)
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm font-semibold mb-1">
              <Compass className="w-3.5 h-3.5 text-slate-300" />
              <span>موضوعات</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">5</span>
          </div>

        </div>

      </div>
    </section>
  );
}
