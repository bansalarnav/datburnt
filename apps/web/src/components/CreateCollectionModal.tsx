import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/button";
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
import type { Collection } from "@/types/collection";
import { apiClient } from "@/utils/apiClient";

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionModal({
  open,
  onOpenChange,
}: CreateCollectionModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createCollectionMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await apiClient.post<Collection>("/collection", data);
      return response.data;
    },
    onSuccess: (newCollection) => {
      queryClient.setQueryData<Collection[]>(["collections"], (old = []) => [
        ...old,
        newCollection,
      ]);

      setTitle("");
      setDescription("");
      setError(null);
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to create collection");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length === 0) {
      setError("Title is required");
      return;
    }

    createCollectionMutation.mutate({
      title,
      description: description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter collection title"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter collection description"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-app-primary"
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
              loading={createCollectionMutation.isPending}
              className="min-w-[120px]"
            >
              Create Collection
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
