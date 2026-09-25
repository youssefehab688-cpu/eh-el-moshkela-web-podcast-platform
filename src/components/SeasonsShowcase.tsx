'use client';

import { Layers, PlayCircle, ArrowLeft, Radio, Moon } from 'lucide-react';
import { Episode, ProgramType } from '@/types';

interface SeasonsShowcaseProps {
  episodes: Episode[];
  selectedProgram: ProgramType;
  onProgramChange: (p: ProgramType) => void;
}

const EH_SEASONS = [
  { number: 6, title: 'الموسم السادس (الحالي)', badge: 'أحدث الجلسات', description: 'من حلقة "لو ما بصليش" وحتى حلقة "الغنى"، مناقشات واقعية مستمرة.', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80' },
  { number: 5, title: 'الموسم الخامس (الاستعداد لرمضان)', badge: 'موسم خاص', description: 'سلسلة مركزة من 6 حلقات مخصصة لشحذ الهمم وتهيئة القلوب للصيام.', image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80' },
  { number: 4, title: 'الموسم الرابع', badge: '12 حلقة', description: 'من "الكذب" والتفاهة وإنكار السنة وحتى ختام "إيه المشكلة في إيه المشكلة".', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80' },
  { number: 3, title: 'الموسم الثالث', badge: 'استوديو حواري', description: 'من "الموضة" إلى ختام "الاستعداد لرمضان" الأول، وقضايا الأسرة والمجتمع.', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80' },
  { number: 2, title: 'الموسم الثاني', badge: 'تثبيت المفاهيم', description: 'من "المصيف والساحل والرحلات" والأفراح وحتى حلقة "النجاح".', image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80' },
  { number: 1, title: 'الموسم الأول (البدايات)', badge: 'الانطلاقة الأولى', description: 'من الافتتاحية الأولى "لو مفيش دين" وحتى "لو مش بنصوم رمضان وليه مهم".', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
];

const MAGHREB_SEASONS = [
  { number: 3, title: 'عالـمغرب (الموسم 3)', badge: 'رمضان 1445', description: 'إنه يحب الله ورسوله، الحب انتصر، ليلة العفو التام، وخواطر ما قبل الإفطار.', image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80' },
  { number: 2, title: 'عالـمغرب (الموسم 2)', badge: 'رمضان 1444', description: 'قصص وعبر: الفتاة صاحبة العقد، الدجاجة والعشر دنانير، والإمام والخباز.', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80' },
  { number: 1, title: 'عالـمغرب (الموسم 1)', badge: 'رمضان 1443', description: 'الجلسات الرمضانية العفوية الأولى وروحانيات ساعة ما قبل أذان المغرب.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
];

export default function SeasonsShowcase({ episodes, selectedProgram, onProgramChange }: SeasonsShowcaseProps) {
  const currentSeasons = selectedProgram === 'eh-el-moshkla' ? EH_SEASONS : MAGHREB_SEASONS;

  const handleSeasonClick = (seasonNumber: number) => {
    window.dispatchEvent(new CustomEvent('select-season', { detail: String(seasonNumber) }));
    const element = document.getElementById('series');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="seasons-section" className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-slate-300 border border-zinc-800">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {selectedProgram === 'eh-el-moshkla' ? 'مواسم بودكاست إيه المشكلة (6 مواسم)' : 'مواسم برنامج عالـمغرب (3 مواسم)'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              اختر الموسم لعرض حلقاته المرتبة والمفروزة بالكامل
            </p>
          </div>
        </div>

        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => onProgramChange('eh-el-moshkla')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedProgram === 'eh-el-moshkla'
                ? 'bg-zinc-100 text-zinc-950 shadow-md scale-100'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>بودكاست إيه المشكلة</span>
          </button>

          <button
            onClick={() => onProgramChange('ala-el-maghreb')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedProgram === 'ala-el-maghreb'
                ? 'bg-zinc-100 text-zinc-950 shadow-md scale-100'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>برنامج عالـمغرب</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedProgram === 'eh-el-moshkla' ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-4`}>
        {currentSeasons.map((item) => {
          const count = episodes.filter(
            (ep) => (ep.program || 'eh-el-moshkla') === selectedProgram && Number(ep.season) === item.number
          ).length;

          return (
            <div
              key={item.number}
              onClick={() => handleSeasonClick(item.number)}
              className="group relative flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-500 hover:bg-zinc-900/80 overflow-hidden transition-all duration-300 shadow-lg cursor-pointer"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                  {item.badge}
                </span>

                <span className="absolute bottom-2.5 right-2.5 text-xs font-bold text-white flex items-center gap-1.5 bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 backdrop-blur-sm">
                  <PlayCircle className="w-3.5 h-3.5 text-slate-300" />
                  <span>{count} حلقات</span>
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors pt-2 border-t border-zinc-800/60">
                  <span>تصفح الحلقات</span>
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
