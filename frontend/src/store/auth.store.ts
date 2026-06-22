import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setToken: (token) =>
        set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null, isAuthenticated: false });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            set({ token: session.access_token });
            // Profile is fetched separately via react-query
          }
        } catch (e) {
          console.error(e);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
