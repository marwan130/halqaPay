import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSummary } from "../types";

interface AuthState {
  token: string | null;
  user: UserSummary | null;
  setSession: (token: string, user: UserSummary) => void;
  patchUser: (partial: Partial<UserSummary>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      patchUser: (partial) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...partial } } : {}
        ),
      logout: () => set({ token: null, user: null })
    }),
    { name: "halqapay-auth" }
  )
);
