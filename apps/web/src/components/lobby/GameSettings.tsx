interface GameSettingsProps {
  maxPlayers: number;
  numRounds: number;
  collectionsCount: number;
}

export function GameSettings({
  maxPlayers,
  numRounds,
  collectionsCount,
}: GameSettingsProps) {
  return (
    <div className="bg-card border-2 border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Game Settings</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-app-primary">
            {maxPlayers}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Max Players</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-app-primary">{numRounds}</div>
          <div className="text-sm text-muted-foreground mt-1">Rounds</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-app-primary">
            {collectionsCount}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Collections</div>
        </div>
      </div>
    </div>
  );
}
