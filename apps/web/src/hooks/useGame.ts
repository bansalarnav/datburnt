import type { ClientGameEvent, ServerGameEvent } from "@datburnt/types/game";
import { useCallback, useRef } from "react";
import { useGameStore } from "../state/game";
import { useUserStore } from "../state/user";

interface UseGameOptions {
  ws: WebSocket | null;
}

export function useGame({ ws }: UseGameOptions) {
  const setPlayers = useGameStore((state) => state.setPlayers);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const removePlayer = useGameStore((state) => state.removePlayer);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const setError = useGameStore((state) => state.setError);
  const setStatus = useGameStore((state) => state.setStatus);

  const user = useUserStore((state) => state.user);
  const currentUserIdRef = useRef<string | null>(null);

  const handleMessage = useCallback(
    (message: ServerGameEvent) => {
      switch (message.type) {
        case "game_info":
          setPlayers(message.data.players);
          setStatus(message.data.status);

          if (!currentUserIdRef.current) {
            if (user) {
              currentUserIdRef.current = user.id;
            } else {
              const lastPlayer =
                message.data.players[message.data.players.length - 1];
              if (lastPlayer) {
                currentUserIdRef.current = lastPlayer.id;
              }
            }
          }
          break;

        case "player_joined":
          addPlayer(message.data);
          break;

        case "player_disconnected":
          updatePlayer(message.data.playerId, { connected: false });
          break;

        case "player_kicked":
          if (message.data.playerId === currentUserIdRef.current) {
            setError("You were kicked from the game");
            ws?.close();
          } else {
            removePlayer(message.data.playerId);
          }
          break;

        case "game_started":
          setStatus("playing");
          break;

        case "error":
          setError(message.message);
          break;
      }
    },
    [
      setPlayers,
      addPlayer,
      removePlayer,
      updatePlayer,
      setError,
      setStatus,
      user,
      ws,
    ]
  );

  const sendMessage = useCallback(
    (message: ClientGameEvent) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    [ws]
  );

  const kickPlayer = useCallback(
    (playerId: string) => {
      sendMessage({ type: "kick_player", playerId });
    },
    [sendMessage]
  );

  const startGame = useCallback(() => {
    sendMessage({ type: "start_game" });
  }, [sendMessage]);

  return {
    handleMessage,
    kickPlayer,
    startGame,
  };
}
