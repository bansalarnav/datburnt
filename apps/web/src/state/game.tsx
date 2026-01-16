import type { GameInfo, GameStatus, Player } from "@datburnt/types/game";
import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";

interface GameState {
  gameId: string;
  info: GameInfo;
  players: Player[];
  status: GameStatus;
  error: string | null;

  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setError: (error: string | null) => void;
  setStatus: (status: GameStatus) => void;
  reset: () => void;
}

const createGameStore = (
  gameId: string,
  initialInfo: GameInfo,
  initialPlayers: Player[],
  initialStatus: GameStatus
) => {
  const initialState = {
    gameId,
    info: initialInfo,
    players: initialPlayers,
    status: initialStatus,
    error: null,
  };

  return createStore<GameState>((set) => ({
    ...initialState,

    setPlayers: (players) => set({ players }),

    addPlayer: (player) =>
      set((state) => ({
        players: [...state.players.filter((p) => p.id !== player.id), player],
      })),

    removePlayer: (playerId) =>
      set((state) => ({
        players: state.players.filter((p) => p.id !== playerId),
      })),

    updatePlayer: (playerId, updates) =>
      set((state) => ({
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        ),
      })),

    setError: (error) => set({ error }),
    setStatus: (status) => set({ status }),
    reset: () => set(initialState),
  }));
};

type GameStore = ReturnType<typeof createGameStore>;

const GameContext = createContext<GameStore | null>(null);

interface GameProviderProps {
  gameId: string;
  initialInfo: GameInfo;
  initialPlayers: Player[];
  initialStatus: GameStatus;
  children: React.ReactNode;
}

export function GameProvider({
  gameId,
  initialInfo,
  initialPlayers,
  initialStatus,
  children,
}: GameProviderProps) {
  const [store] = useState(() =>
    createGameStore(gameId, initialInfo, initialPlayers, initialStatus)
  );

  return <GameContext.Provider value={store}>{children}</GameContext.Provider>;
}

export function useGameStore<T>(selector: (state: GameState) => T): T {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error("useGameStore must be used within a GameProvider");
  }
  return useStore(store, selector);
}
