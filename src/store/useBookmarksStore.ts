import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BookmarksState {
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      toggleBookmark: (id: string) => {
        const { bookmarks } = get();
        const exists = bookmarks.includes(id);
        set({
          bookmarks: exists
            ? bookmarks.filter((item) => item !== id)
            : [...bookmarks, id],
        });
      },
      isBookmarked: (id: string) => {
        return (get().bookmarks || []).includes(id);
      },
    }),
    {
      name: 'eh-podcast-bookmarks',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);

export const useBookmarkStore = useBookmarksStore;
export default useBookmarksStore;
