import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";

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

const createUserStore = (initUser: User | null) => {
  return createStore<UserState>((set) => ({
    user: initUser,
    setUser: (user) => set({ user }),
  }));
};

type UserStore = ReturnType<typeof createUserStore>;

const UserContext = createContext<UserStore | null>(null);

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const [store] = useState(() => createUserStore(initialUser));

  return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
}

export function useUserStore<T>(selector: (state: UserState) => T): T {
  const store = useContext(UserContext);
  if (!store) {
    throw new Error("useUserStore must be used within an AuthProvider");
  }
  return useStore(store, selector);
}
