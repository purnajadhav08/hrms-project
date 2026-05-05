import { create } from "zustand";
import type { User, Tokens } from "@/types/auth";

interface AuthState {
  user:       User | null;
  isLoggedIn: boolean;
  setAuth:    (user: User, tokens: Tokens) => void;
  logout:     () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isLoggedIn: !!localStorage.getItem("access_token"),
  setAuth: (user, tokens) => {
    localStorage.setItem("access_token",  tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    set({ user, isLoggedIn: true });
  },
  logout: () => {
    localStorage.clear();
    set({ user: null, isLoggedIn: false });
  },
}));
