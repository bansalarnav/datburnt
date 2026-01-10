import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { apiClient } from "@/utils/apiClient";

interface Collection {
  id: string;
  title: string;
  description?: string;
  imageCount: number;
}

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState<number[]>([6]);
  const [numRounds, setNumRounds] = useState<number[]>([6]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch collections using TanStack Query
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await apiClient.get<Collection[]>("/collection/all");
      return response.data;
    },
    enabled: open,
  });

  // Pre-select all collections when data is loaded
  useEffect(() => {
    if (collections.length > 0 && selectedCollections.size === 0) {
      setSelectedCollections(new Set(collections.map((c) => c.id)));
    }
  }, [collections, selectedCollections.size]);

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (data: {
      maxPlayers: number;
      numRounds: number;
      collections: string[];
    }) => {
      const response = await apiClient.post<{
        success: boolean;
        game: { id: string };
        message?: string;
      }>("/game", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        onOpenChange(false);
        navigate({
          to: "/game/$gameId",
          params: { gameId: data.game.id },
        });
      } else {
        setError(data.message || "Failed to create room.");
      }
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create room. Please try again."
      );
    },
  });

  const toggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleCreateRoom = async () => {
    if (selectedCollections.size === 0) {
      setError("Please select at least one collection.");
      return;
    }

    setError(null);
    createRoomMutation.mutate({
      maxPlayers: maxPlayers[0],
      numRounds: numRounds[0],
      collections: Array.from(selectedCollections),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
          <DialogDescription>
            Configure your game settings and select collections to play with.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Max Players Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-players" className="text-base font-medium">
                Max Players
              </Label>
              <span className="text-sm font-semibold text-muted-foreground">
                {maxPlayers[0]}
              </span>
            </div>
            <Slider
              id="max-players"
              min={4}
              max={8}
              step={1}
              value={maxPlayers}
              onValueChange={setMaxPlayers}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>8</span>
            </div>
          </div>

          {/* Num Rounds Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="num-rounds" className="text-base font-medium">
                Number of Rounds
              </Label>
              <span className="text-sm font-semibold text-muted-foreground">
                {numRounds[0]}
              </span>
            </div>
            <Slider
              id="num-rounds"
              min={1}
              max={10}
              step={1}
              value={numRounds}
              onValueChange={setNumRounds}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Collections to Include
            </Label>

            {loadingCollections ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-app-primary animate-[flashing_1.4s_infinite_linear]"></div>
                  <div className="w-2 h-2 rounded-full bg-app-primary animate-[flashing_1.4s_infinite_linear] [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-app-primary animate-[flashing_1.4s_infinite_linear] [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No collections available. Please{" "}
                <a
                  href="/my-account#collections"
                  className="text-app-primary hover:underline font-medium"
                >
                  create a collection first
                </a>
                .
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto border rounded-md p-4">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={collection.id}
                      checked={selectedCollections.has(collection.id)}
                      onCheckedChange={() => toggleCollection(collection.id)}
                    />
                    <Label
                      htmlFor={collection.id}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      <div className="font-medium">{collection.title}</div>
                      {collection.description && (
                        <div className="text-xs text-muted-foreground">
                          {collection.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {collection.imageCount} images
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={createRoomMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <PrimaryButton
            onClick={handleCreateRoom}
            disabled={
              createRoomMutation.isPending ||
              selectedCollections.size === 0 ||
              collections.length === 0
            }
            loading={createRoomMutation.isPending}
            className="min-w-[120px]"
          >
            Create Room
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
