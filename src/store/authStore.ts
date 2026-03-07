// money-tracker-fe/src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        // persist middleware sudah handle simpan ke localStorage secara otomatis
        // tidak perlu localStorage.setItem manual — itu yang bikin konflik
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
