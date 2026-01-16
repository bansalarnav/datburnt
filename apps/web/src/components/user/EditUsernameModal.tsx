import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryButton } from "@/components/ui/button";
import { apiClient } from "@/utils/apiClient";
import { useUserStore, type User } from "@/state/user";

interface EditUsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUsernameModal({
  open,
  onOpenChange,
}: EditUsernameModalProps) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const [username, setUsername] = useState(user?.username || "");
  const [error, setError] = useState<string | null>(null);

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      const response = await apiClient.put<{
        success: boolean;
        user?: User;
        message?: string;
      }>("/user/username", {
        username: newUsername,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        queryClient.setQueryData(["user"], data.user);
        onOpenChange(false);
        setError(null);
      } else {
        setError(data.message || "Failed to update username");
      }
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    updateUsernameMutation.mutate(username);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Username</DialogTitle>
          <DialogDescription>
            Change your username. This will be visible to other users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                minLength={3}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit"
              loading={updateUsernameMutation.isPending}
              className="min-w-[120px]"
            >
              Save Changes
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
