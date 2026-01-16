import type { Player } from "@datburnt/types/game";
import { PlayerCard } from "./PlayerCard";

interface PlayersListProps {
  players: Player[];
  ownerId: string;
  maxPlayers: number;
  currentUserId: string | null;
  onKick: (playerId: string) => void;
}

export function PlayersList({
  players,
  ownerId,
  maxPlayers,
  currentUserId,
  onKick,
}: PlayersListProps) {
  const isCurrentUserOwner = currentUserId === ownerId;
  const connectedPlayers = players.filter((p) => p.connected);
  const emptySlots = Math.max(0, maxPlayers - connectedPlayers.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Players ({connectedPlayers.length}/{maxPlayers})
        </h2>
        <div className="text-sm text-muted-foreground">
          {connectedPlayers.length < 3
            ? "Need at least 3 players to start"
            : "Ready to start!"}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {connectedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isOwner={player.id === ownerId}
            isCurrentUserOwner={isCurrentUserOwner}
            onKick={onKick}
          />
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="p-4 rounded-xl border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center"
          >
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">+</div>
              <p className="text-sm">Empty Slot</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
