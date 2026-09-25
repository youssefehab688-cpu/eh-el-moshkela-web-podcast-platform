'use client';

import { useState, useMemo, useEffect } from 'react';
import { Episode, ProgramType } from '@/types';
import EpisodeCard from './EpisodeCard';
import { Search, Filter, Sparkles, X } from 'lucide-react';

interface EpisodeFilterProps {
  episodes: Episode[];
  selectedProgram: ProgramType;
}

export default function EpisodeFilter({ episodes, selectedProgram }: EpisodeFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const seasonsList = useMemo(() => {
    if (selectedProgram === 'ala-el-maghreb') {
      return [
        { label: 'كل المواسم', value: 'all' },
        { label: 'عالـمغرب (٣)', value: '3' },
        { label: 'عالـمغرب (٢)', value: '2' },
        { label: 'عالـمغرب (١)', value: '1' },
      ];
    }
    return [
      { label: 'كل المواسم', value: 'all' },
      { label: 'الموسم السادس (الحالي)', value: '6' },
      { label: 'الموسم الخامس (الاستعداد لرمضان)', value: '5' },
      { label: 'الموسم الرابع', value: '4' },
      { label: 'الموسم الثالث', value: '3' },
      { label: 'الموسم الثاني', value: '2' },
      { label: 'الموسم الأول', value: '1' },
    ];
  }, [selectedProgram]);

  const topicsList = [
    { label: 'كل المواضيع', value: 'all' },
    { label: 'إيمانيات وتزكية', value: 'إيمانيات وتزكية' },
    { label: 'علاقات وزواج', value: 'علاقات وزواج' },
    { label: 'معاملات وأموال', value: 'معاملات وأموال' },
    { label: 'تطوير وعادات', value: 'تطوير وعادات' },
    { label: 'شبهات وأسئلة', value: 'شبهات وأسئلة' },
  ];

  useEffect(() => {
    setSelectedSeason('all');
  }, [selectedProgram]);

  useEffect(() => {
    const handleSeasonSelect = (e: any) => {
      if (e.detail) setSelectedSeason(String(e.detail));
    };
    window.addEventListener('select-season', handleSeasonSelect);
    return () => window.removeEventListener('select-season', handleSeasonSelect);
  }, []);

  const filteredAndSortedEpisodes = useMemo(() => {
    if (!Array.isArray(episodes)) return [];

    const filtered = episodes.filter((ep) => {
      const epProgram = ep.program || 'eh-el-moshkla';
      if (epProgram !== selectedProgram) return false;

      const title = ep.title || '';
      const desc = ep.description || '';
      const epSeason = String(ep.season || '');
      const epTopic = ep.topic || '';

      const matchesSearch =
        searchQuery === '' ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeason =
        selectedSeason === 'all' || epSeason === selectedSeason;

      const matchesTopic =
        selectedTopic === 'all' || epTopic === selectedTopic;

      return matchesSearch && matchesSeason && matchesTopic;
    });

    return filtered.sort((a, b) => {
      const seasonA = Number(a.season) || 0;
      const seasonB = Number(b.season) || 0;
      const epA = Number(a.episode_number) || 0;
      const epB = Number(b.episode_number) || 0;

      if (selectedSeason !== 'all') {
        return epA - epB;
      }
      if (seasonB !== seasonA) {
        return seasonB - seasonA;
      }
      return epA - epB;
    });
  }, [episodes, selectedProgram, searchQuery, selectedSeason, selectedTopic]);

  const hasActiveFilters = selectedSeason !== 'all' || selectedTopic !== 'all' || searchQuery !== '';

  const resetFilters = () => {
    setSelectedSeason('all');
    setSelectedTopic('all');
    setSearchQuery('');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-4 bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 rounded-2xl backdrop-blur-sm shadow-xl">
        <div className="relative w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث في حلقات ${selectedProgram === 'eh-el-moshkla' ? 'إيه المشكلة' : 'عالـمغرب'}...`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              مسح
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-zinc-500 flex items-center gap-1 font-semibold pl-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            المواسم:
          </span>
          {seasonsList.map((season) => (
            <button
              key={season.value}
              onClick={() => setSelectedSeason(season.value)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedSeason === season.value
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {season.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-zinc-800/60 pt-3">
          <span className="text-zinc-500 flex items-center gap-1 font-semibold pl-2 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            المواضيع:
          </span>
          {topicsList.map((topic) => (
            <button
              key={topic.value}
              onClick={() => setSelectedTopic(topic.value)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedTopic === topic.value
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'bg-zinc-950/50 text-zinc-400 hover:text-zinc-300 border border-zinc-800/60'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-zinc-400 font-medium">
          عرض <strong className="text-white font-bold">{filteredAndSortedEpisodes.length}</strong> حلقة في {selectedProgram === 'eh-el-moshkla' ? 'بودكاست إيه المشكلة' : 'برنامج عالـمغرب'}
        </span>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            <span>إلغاء الفلاتر</span>
          </button>
        )}
      </div>

      {filteredAndSortedEpisodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/60 flex flex-col items-center gap-3">
          <p className="text-zinc-400 text-sm">لا توجد حلقات تطابق هذا الفلتر حالياً.</p>
          <button
            onClick={resetFilters}
            className="text-xs text-slate-200 underline font-semibold"
          >
            عرض كل الحلقات
          </button>
        </div>
      )}
    </div>
  );
}
