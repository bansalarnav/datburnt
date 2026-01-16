import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { CreateRoomModal } from "@/components/lobby/CreateRoomModal";
import { PrimaryButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/state/user";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [gameCode, setGameCode] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  const handleJoinRoom = () => {
    if (gameCode.trim().length === 6) {
      navigate({ to: "/game/$gameId", params: { gameId: gameCode.trim() } });
    }
  };

  const handleCreateRoom = () => {
    setCreateRoomModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthModalOpen(true);
  };

  return (
    <>
      {user && (
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={() => navigate({ to: "/my-account" } as any)}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <UserIcon className="h-4 w-4" />
            <span className="text-sm font-medium">My Account</span>
          </button>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Join or Create a Game
          </h1>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Game Code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.slice(0, 6))}
              maxLength={6}
              className="text-lg tracking-wider"
            />

            <PrimaryButton
              onClick={handleJoinRoom}
              disabled={gameCode.trim().length !== 6}
              className="w-full"
            >
              Join Room
            </PrimaryButton>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">or</span>
              </div>
            </div>

            {user ? (
              <PrimaryButton onClick={handleCreateRoom} className="w-full">
                Create Room
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleSignIn} className="w-full">
                Sign In to Create Room
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CreateRoomModal
        open={createRoomModalOpen}
        onOpenChange={setCreateRoomModalOpen}
      />
    </>
  );
}
