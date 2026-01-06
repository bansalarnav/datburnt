import { useEffect } from "react";
import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  return children;
}
