import { useGameStore } from "../../state/game";
import { useUserStore } from "../../state/user";
import { GameSettings } from "./GameSettings";
import { LobbyHeader } from "./LobbyHeader";
import { PlayersList } from "./PlayersList";
import { StartGameButton } from "./StartGameButton";

interface GameLobbyProps {
  kickPlayer: (playerId: string) => void;
  startGame: () => void;
}

export function GameLobby({ kickPlayer, startGame }: GameLobbyProps) {
  const gameId = useGameStore((state) => state.gameId);
  const info = useGameStore((state) => state.info);
  const players = useGameStore((state) => state.players);
  const user = useUserStore((state) => state.user);

  const currentUserId = user?.id || null;
  const isOwner = currentUserId === info.owner;
  const connectedPlayers = players.filter((p) => p.connected);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <LobbyHeader gameId={gameId} />

        <GameSettings
          maxPlayers={info.maxPlayers}
          numRounds={info.numRounds}
          collectionsCount={info.collections.length}
        />

        <PlayersList
          players={players}
          ownerId={info.owner}
          maxPlayers={info.maxPlayers}
          currentUserId={currentUserId}
          onKick={kickPlayer}
        />

        {isOwner && (
          <StartGameButton
            playerCount={connectedPlayers.length}
            onStart={startGame}
          />
        )}
      </div>
    </div>
  );
}
