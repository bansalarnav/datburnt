import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface LobbyHeaderProps {
  gameId: string;
}

export function LobbyHeader({ gameId }: LobbyHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Game Lobby</h1>
        <p className="text-muted-foreground">Waiting for players to join...</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="text-sm text-muted-foreground">Game Code:</div>
        <div className="flex items-center gap-2 bg-card border-2 border-border rounded-lg px-4 py-2">
          <span className="text-2xl font-bold font-mono tracking-wider">
            {gameId}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Copy game code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-neon-green" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
