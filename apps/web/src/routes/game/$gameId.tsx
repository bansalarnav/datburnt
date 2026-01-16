import type {
  GameInfo,
  GameStatus,
  Player,
  ServerGameEvent,
} from "@datburnt/types/game";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ErrorScreen } from "../../components/game/ErrorScreen";
import { LoadingScreen } from "../../components/game/LoadingScreen";
import { GameLobby } from "../../components/lobby/GameLobby";
import { GuestNameModal } from "../../components/lobby/GuestNameModal";
import { useGame } from "../../hooks/useGame";
import { useWebSocket } from "../../hooks/useWebSocket";
import { GameProvider, useGameStore } from "../../state/game";
import { useUserStore } from "../../state/user";

export const Route = createFileRoute("/game/$gameId")({
  component: GameRoute,
});

function GameRoute() {
  const { gameId } = Route.useParams();
  const user = useUserStore((state) => state.user);

  const [guestName, setGuestName] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [initialData, setInitialData] = useState<{
    info: GameInfo;
    players: Player[];
    status: GameStatus;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setShowGuestModal(true);
    }
  }, [user]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    setShowGuestModal(false);
  };

  const shouldConnect = user !== null || guestName !== null;

  const wsUrl = useMemo(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const apiUrl = import.meta.env.VITE_API_URL || "localhost:8000";
    const host = apiUrl.replace(/^https?:\/\//, "");

    let url = `${protocol}//${host}/ws/game?gameId=${gameId}`;
    if (guestName) {
      url += `&name=${encodeURIComponent(guestName)}`;
    }
    return url;
  }, [gameId, guestName]);

  const { ws, connectionStatus } = useWebSocket({
    url: wsUrl,
    enabled: shouldConnect,
    onMessage: (data) => {
      const message = data as {
        type: string;
        data?: unknown;
        message?: string;
      };
      if (message.type === "game_info" && !initialData) {
        const gameInfoData = message.data as {
          players: Player[];
          status: GameStatus;
          [key: string]: unknown;
        };
        const { players, status, ...info } = gameInfoData;
        setInitialData({ info: info as GameInfo, players, status });
      } else if (message.type === "error" && message.message) {
        setError(message.message);
      }
    },
  });

  if (showGuestModal) {
    return <GuestNameModal open onSubmit={handleGuestNameSubmit} />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!initialData || connectionStatus !== "connected") {
    return <LoadingScreen message="Connecting to game..." />;
  }

  return (
    <GameProvider
      gameId={gameId}
      initialInfo={initialData.info}
      initialPlayers={initialData.players}
      initialStatus={initialData.status}
    >
      <GameComponent guestName={guestName} ws={ws!} />
    </GameProvider>
  );
}

interface GameComponentProps {
  guestName: string | null;
  ws: WebSocket;
}

function GameComponent({ guestName, ws }: GameComponentProps) {
  const { handleMessage, kickPlayer, startGame } = useGame({ ws });

  useEffect(() => {
    if (!ws) return;

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data as ServerGameEvent);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.addEventListener("message", onMessage);

    return () => {
      ws.removeEventListener("message", onMessage);
    };
  }, [ws, handleMessage]);

  const status = useGameStore((state) => state.status);
  const error = useGameStore((state) => state.error);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (status === "lobby") {
    return <GameLobby kickPlayer={kickPlayer} startGame={startGame} />;
  }

  if (status === "playing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Game Starting...</h1>
          <p className="text-muted-foreground">Gameplay phase coming soon!</p>
        </div>
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Game Finished!</h1>
          <p className="text-muted-foreground">Results phase coming soon!</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
