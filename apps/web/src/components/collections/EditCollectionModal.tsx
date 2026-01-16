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

interface EditCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    title: string;
    description?: string;
  };
}

function EditCollectionForm({
  collection,
  onOpenChange,
}: {
  collection: { id: string; title: string; description?: string };
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");
  const [error, setError] = useState<string | null>(null);

  const editCollectionMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await apiClient.put<Collection>(
        `/collection/${collection.id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedCollection) => {
      queryClient.setQueryData<Collection[]>(["collections"], (old = []) =>
        old.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
      );

      setError(null);
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to update collection");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length === 0) {
      setError("Title is required");
      return;
    }

    editCollectionMutation.mutate({
      title,
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter collection title"
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-description">Description (optional)</Label>
          <textarea
            id="edit-description"
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
          loading={editCollectionMutation.isPending}
          className="min-w-[120px]"
        >
          Save Changes
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export function EditCollectionModal({
  open,
  onOpenChange,
  collection,
}: EditCollectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update your collection's title and description.
          </DialogDescription>
        </DialogHeader>
        <EditCollectionForm
          key={collection.id}
          collection={collection}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
