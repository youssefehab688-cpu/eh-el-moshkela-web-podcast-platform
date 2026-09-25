import { create } from 'zustand';

interface BookmarkState {
  bookmarkedIds: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  loadBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedIds: [],

  isBookmarked: (id: string) => {
    return get().bookmarkedIds.includes(id);
  },

  toggleBookmark: (id: string) => {
    const current = get().bookmarkedIds;
    const exists = current.includes(id);
    const updated = exists 
      ? current.filter((item) => item !== id) 
      : [...current, id];

    set({ bookmarkedIds: updated });

    try {
      localStorage.setItem('eh_bookmarks', JSON.stringify(updated));
    } catch {}
  },

  loadBookmarks: () => {
    try {
      const saved = localStorage.getItem('eh_bookmarks');
      if (saved) {
        set({ bookmarkedIds: JSON.parse(saved) });
      }
    } catch {}
  },
}));
