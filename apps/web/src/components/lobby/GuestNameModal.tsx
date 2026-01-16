import { useState } from "react";
import { PrimaryButton } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface GuestNameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

export function GuestNameModal({ open, onSubmit }: GuestNameModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (name.length > 20) {
      setError("Name too long (max 20 characters)");
      return;
    }

    onSubmit(name.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        /* Can't close */
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
          <DialogDescription>
            Choose a display name to join the game
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <PrimaryButton type="submit" className="w-full">
            Join Game
          </PrimaryButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
