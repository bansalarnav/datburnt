import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
