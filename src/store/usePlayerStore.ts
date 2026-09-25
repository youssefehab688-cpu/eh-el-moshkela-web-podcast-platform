import { create } from 'zustand';
import { Episode } from '@/types';

interface PlayerState {
  currentEpisode: Episode | null;
  playlist: Episode[];
  isPlaying: boolean;
  mode: 'video' | 'audio';
  currentTime: number;
  duration: number;

  // Actions
  setPlaylist: (episodes: Episode[]) => void;
  playEpisode: (episode: Episode, mode?: 'video' | 'audio', startTime?: number) => void;
  pauseEpisode: () => void;
  resumeEpisode: () => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setMode: (mode: 'video' | 'audio', syncTime?: number) => void;
  toggleMode: () => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentEpisode: null,
  playlist: [],
  isPlaying: false,
  mode: 'video',
  currentTime: 0,
  duration: 0,

  setPlaylist: (playlist: Episode[]) => set({ playlist }),

  playEpisode: (episode: Episode, mode = 'video', startTime?: number) => {
    const prev = get().currentEpisode;
    const isSame = prev?.id === episode.id;
    const currentMode = mode || get().mode;
    const timeToStart = typeof startTime === 'number' ? startTime : (isSame ? get().currentTime : 0);

    set({
      currentEpisode: episode,
      mode: currentMode,
      isPlaying: true,
      currentTime: timeToStart,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-cmd-play'));
      if (timeToStart > 0) {
        window.dispatchEvent(new CustomEvent('player-cmd-seek', { detail: timeToStart }));
      }
    }
  },

  pauseEpisode: () => {
    set({ isPlaying: false });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-cmd-pause'));
    }
  },

  resumeEpisode: () => {
    set({ isPlaying: true });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-cmd-play'));
    }
  },

  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pauseEpisode();
    } else {
      get().resumeEpisode();
    }
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTime: (currentTime: number) => set({ currentTime }),
  setDuration: (duration: number) => set({ duration }),

  setMode: (newMode: 'video' | 'audio', syncTime?: number) => {
    const { mode } = get();
    if (mode === newMode) return;
    const targetTime = typeof syncTime === 'number' ? syncTime : get().currentTime;
    set({ mode: newMode, currentTime: targetTime });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-mode-switched', { 
        detail: { mode: newMode, time: targetTime } 
      }));
    }
  },

  toggleMode: () => {
    const next = get().mode === 'video' ? 'audio' : 'video';
    get().setMode(next);
  },

  seekTo: (time: number) => {
    set({ currentTime: time });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-cmd-seek', { detail: time }));
    }
  },

  playNext: () => {
    const { playlist, currentEpisode, playEpisode, mode } = get();
    if (!currentEpisode || playlist.length === 0) return;
    const currentProg = currentEpisode.program || 'eh-el-moshkla';
    const programEpisodes = playlist.filter((ep) => (ep.program || 'eh-el-moshkla') === currentProg);
    const currentIndex = programEpisodes.findIndex((ep) => ep.id === currentEpisode.id);

    if (currentIndex >= 0 && currentIndex < programEpisodes.length - 1) {
      const nextEp = programEpisodes[currentIndex + 1];
      playEpisode(nextEp, mode, 0);
    }
  },

  playPrevious: () => {
    const { playlist, currentEpisode, playEpisode, mode } = get();
    if (!currentEpisode || playlist.length === 0) return;
    const currentProg = currentEpisode.program || 'eh-el-moshkla';
    const programEpisodes = playlist.filter((ep) => (ep.program || 'eh-el-moshkla') === currentProg);
    const currentIndex = programEpisodes.findIndex((ep) => ep.id === currentEpisode.id);

    if (currentIndex > 0) {
      const prevEp = programEpisodes[currentIndex - 1];
      playEpisode(prevEp, mode, 0);
    }
  },
}));
