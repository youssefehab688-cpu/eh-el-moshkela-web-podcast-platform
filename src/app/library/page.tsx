import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { getAllRecommendations } from '@/lib/api';
import { BookOpen, ExternalLink, ArrowLeft, Bookmark } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60; // تحديث دوري سريع

export default async function LibraryPage() {
  const recommendations = await getAllRecommendations();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-32">
      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 flex-1">
        
        {/* رأس الصفحة */}
        <div className="flex flex-col gap-3 mb-10 pb-6 border-b border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-slate-300 text-xs font-semibold w-fit">
            <Bookmark className="w-3.5 h-3.5" />
            <span>المصادر المفتوحة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white">
            مكتبة التوصيات والكتب المذكورة
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            جميع الكتب، المراجع، والخرائط الإيمانية والفكرية التي رشحها د. أمير منير، د. ياسر ممدوح، ود. محمد الغليظ أثناء الحلقات.
          </p>
        </div>

        {/* شبكة الكتب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200 group shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-slate-200 border border-zinc-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors">
                    {rec.title}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    المؤلف / المصدر: <strong className="text-zinc-300 font-semibold">{rec.author_or_source || 'غير محدد'}</strong>
                  </span>
                </div>
              </div>

              {/* ربط التوصية بالحلقة التي وردت فيها */}
              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                {rec.episodeSlug ? (
                  <Link
                    href={`/episodes/${rec.episodeSlug}`}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium"
                  >
                    <span>ذُكر في: {rec.episodeTitle || 'عرض الحلقة'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-zinc-500">حلقة عامة</span>
                )}

                {rec.external_url && (
                  <a
                    href={rec.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-zinc-400 hover:text-white"
                  >
                    <span>تحميل / قراءة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>

      <Player />
    </div>
  );
}
