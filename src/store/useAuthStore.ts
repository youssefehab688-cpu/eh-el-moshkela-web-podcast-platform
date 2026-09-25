import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthModalOpen: boolean;
  setUser: (user: User | null) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthModalOpen: false,
  setUser: (user) => set({ user }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
