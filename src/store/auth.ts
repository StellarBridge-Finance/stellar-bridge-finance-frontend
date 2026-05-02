import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  employer: string | null;
  setAuth: (token: string, employer: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      employer: null,
      setAuth: (token, employer) => set({ token, employer }),
      clear: () => set({ token: null, employer: null }),
    }),
    { name: 'sb-auth' }
  )
);
