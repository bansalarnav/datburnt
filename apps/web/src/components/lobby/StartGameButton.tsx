import { PrimaryButton } from "../ui/button";

interface StartGameButtonProps {
  playerCount: number;
  minPlayers?: number;
  onStart: () => void;
  disabled?: boolean;
}

export function StartGameButton({
  playerCount,
  minPlayers = 3,
  onStart,
  disabled = false,
}: StartGameButtonProps) {
  const canStart = playerCount >= minPlayers && !disabled;
  const buttonText = !canStart
    ? `Need at least ${minPlayers} players`
    : "Start Game";

  return (
    <div className="flex justify-center">
      <PrimaryButton
        onClick={onStart}
        disabled={!canStart}
        className="w-full max-w-md"
      >
        {buttonText}
      </PrimaryButton>
    </div>
  );
}
