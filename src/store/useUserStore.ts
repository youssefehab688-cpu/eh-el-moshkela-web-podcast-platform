import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  favorites: string[]; // مصفوفة بمعرفات الحلقات المحفوظة
  toggleFavorite: (episodeId: string) => void;
  isFavorite: (episodeId: string) => boolean;

  // حفظ الثواني التي توقف عندها المستمع في كل حلقة
  progress: Record<string, number>; 
  saveProgress: (episodeId: string, seconds: number) => void;

  lastEpisodeId: string | null;
  setLastEpisodeId: (episodeId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) => {
        const favs = get().favorites;
        if (favs.includes(id)) {
          set({ favorites: favs.filter((item) => item !== id) });
        } else {
          set({ favorites: [...favs, id] });
        }
      },
      isFavorite: (id) => get().favorites.includes(id),

      progress: {},
      saveProgress: (id, seconds) =>
        set((state) => ({
          progress: { ...state.progress, [id]: Math.floor(seconds) },
          lastEpisodeId: id,
        })),

      lastEpisodeId: null,
      setLastEpisodeId: (id) => set({ lastEpisodeId: id }),
    }),
    {
      name: 'eh_el_moshkela_user_data',
    }
  )
);
