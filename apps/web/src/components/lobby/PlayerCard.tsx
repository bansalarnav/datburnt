import type { Player } from "@datburnt/types/game";

interface PlayerCardProps {
  player: Player;
  isOwner: boolean;
  isCurrentUserOwner: boolean;
  onKick?: (playerId: string) => void;
}

export function PlayerCard({
  player,
  isOwner,
  isCurrentUserOwner,
  onKick,
}: PlayerCardProps) {
  const canKick = isCurrentUserOwner && !isOwner;

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 bg-card
        ${player.connected ? "border-border" : "border-muted opacity-60"}
      `}
    >
      {isOwner && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          👑 Owner
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <img
            src={player.avatar}
            alt={player.name}
            className="w-20 h-20 rounded-full bg-muted"
          />
          {!player.connected && (
            <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                Offline
              </span>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="font-semibold text-foreground truncate max-w-[120px]">
            {player.name}
          </p>
        </div>

        {canKick && player.connected && (
          <button
            onClick={() => onKick?.(player.id)}
            className="
              w-full px-3 py-1 text-sm rounded-md 
              bg-destructive/10 text-destructive 
              hover:bg-destructive/20 
              transition-colors font-medium
            "
          >
            Kick
          </button>
        )}
      </div>
    </div>
  );
}
