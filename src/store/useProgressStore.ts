import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UserProgressItem } from '@/types';

interface ProgressState {
  progressMap: Record<string, UserProgressItem>;
  loading: boolean;
  fetchProgress: (userId: string) => Promise<void>;
  toggleComplete: (userId: string, episodeId: string) => Promise<boolean>;
  updatePosition: (userId: string, episodeId: string, seconds: number, duration: number) => Promise<void>;
  isCompleted: (episodeId: string) => boolean;
  getPosition: (episodeId: string) => number;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  loading: false,

  fetchProgress: async (userId: string) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('episode_id, last_position_seconds, is_completed, updated_at')
        .eq('user_id', userId);

      if (!error && data) {
        const map: Record<string, UserProgressItem> = {};
        data.forEach((item: any) => {
          map[item.episode_id] = {
            episode_id: item.episode_id,
            last_position_seconds: item.last_position_seconds || 0,
            is_completed: !!item.is_completed,
            updated_at: item.updated_at,
          };
        });
        set({ progressMap: map });
      }
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
    } finally {
      set({ loading: false });
    }
  },

  toggleComplete: async (userId: string, episodeId: string) => {
    const current = get().progressMap[episodeId];
    const newStatus = !current?.is_completed;

    // تحديث فوري في الواجهة (Optimistic UI)
    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [episodeId]: {
          episode_id: episodeId,
          last_position_seconds: current?.last_position_seconds || 0,
          is_completed: newStatus,
          updated_at: new Date().toISOString(),
        },
      },
    }));

    if (userId) {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        episode_id: episodeId,
        is_completed: newStatus,
        last_position_seconds: current?.last_position_seconds || 0,
        updated_at: new Date().toISOString(),
      });
    }

    return newStatus;
  },

  updatePosition: async (userId: string, episodeId: string, seconds: number, duration: number) => {
    const isCompleted = duration > 0 && seconds / duration >= 0.9;
    const current = get().progressMap[episodeId];

    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [episodeId]: {
          episode_id: episodeId,
          last_position_seconds: Math.floor(seconds),
          is_completed: current?.is_completed || isCompleted,
          updated_at: new Date().toISOString(),
        },
      },
    }));

    if (userId && Math.floor(seconds) % 10 === 0) {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        episode_id: episodeId,
        last_position_seconds: Math.floor(seconds),
        is_completed: current?.is_completed || isCompleted,
        updated_at: new Date().toISOString(),
      });
    }
  },

  isCompleted: (episodeId: string) => {
    return !!get().progressMap[episodeId]?.is_completed;
  },

  getPosition: (episodeId: string) => {
    return get().progressMap[episodeId]?.last_position_seconds || 0;
  },
}));
