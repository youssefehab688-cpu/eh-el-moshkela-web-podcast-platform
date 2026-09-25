import { supabase } from './supabase';
import { mockEpisodes } from '@/data/mockEpisodes';
import { Episode, Series, Topic, Recommendation } from '@/types';

// جلب جميع الحلقات
export async function getEpisodes(): Promise<Episode[]> {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*, series:series_id(*), recommendations(*)')
      .order('episode_number', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockEpisodes;
    }

    return data as Episode[];
  } catch (err) {
    console.warn('استخدام البيانات المحلية كبديل:', err);
    return mockEpisodes;
  }
}

// جلب حلقة واحدة بالـ slug
export async function getEpisodeBySlug(slug: string): Promise<Episode | null> {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*, series:series_id(*), recommendations(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const fallback = mockEpisodes.find((ep) => ep.slug === slug);
      return fallback || null;
    }

    return data as Episode;
  } catch (err) {
    return mockEpisodes.find((ep) => ep.slug === slug) || null;
  }
}

// جلب كل السلاسل والمواسم
export async function getSeries(): Promise<Series[]> {
  try {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        { id: 's4', title: 'الموسم الرابع (الاستوديو الجديد)', slug: 'season-4', order_index: 1, created_at: '' },
        { id: 's3', title: 'الموسم الثالث', slug: 'season-3', order_index: 2, created_at: '' },
        { id: 's2', title: 'الموسم الثاني', slug: 'season-2', order_index: 3, created_at: '' },
        { id: 's1', title: 'الموسم الأول (البدايات)', slug: 'season-1', order_index: 4, created_at: '' },
      ];
    }
    return data as Series[];
  } catch {
    return [];
  }
}

// جلب كل الكتب والتوصيات لصفحة المكتبة
export async function getAllRecommendations(): Promise<(Recommendation & { episodeTitle?: string; episodeSlug?: string })[]> {
  try {
    const episodes = await getEpisodes();
    const allRecs: (Recommendation & { episodeTitle?: string; episodeSlug?: string })[] = [];

    episodes.forEach((ep) => {
      if (ep.recommendations && ep.recommendations.length > 0) {
        ep.recommendations.forEach((rec) => {
          allRecs.push({
            ...rec,
            episodeTitle: ep.title,
            episodeSlug: ep.slug,
          });
        });
      }
    });

    return allRecs;
  } catch {
    return [];
  }
}
