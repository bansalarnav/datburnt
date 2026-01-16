import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ImageIcon, TrashIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Collection, CollectionWithImages } from "@/types/collection";
import { apiClient } from "@/utils/apiClient";

interface CollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
}

export function CollectionModal({
  open,
  onOpenChange,
  collectionId,
}: CollectionModalProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<CollectionWithImages>({
    queryKey: ["collection", collectionId],
    queryFn: async () => {
      const response = await apiClient.get<CollectionWithImages>(
        `/collection/${collectionId}`
      );
      return response.data;
    },
    enabled: !!collectionId && open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient.delete(`/collection/${collectionId}/image/${imageId}`);
    },
    onSuccess: (_, imageId) => {
      queryClient.setQueryData<CollectionWithImages>(
        ["collection", collectionId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            images: old.images.filter((img) => img.id !== imageId),
          };
        }
      );
      queryClient.setQueryData<Collection[]>(["collections"], (old = []) =>
        old.map((c) =>
          c.id === collectionId ? { ...c, imageCount: c.imageCount - 1 } : c
        )
      );
      setDeleteImageId(null);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { data: uploadData } = await apiClient.post<{
          uploadUrl: string;
          imageId: string;
        }>(`/collection/${collectionId}/image`, { filename: file.name });

        const { uploadUrl } = uploadData;

        await axios.put(uploadUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });

        const { data: newImage } = await apiClient.post<
          CollectionWithImages["images"][0]
        >(`/collection/${collectionId}/image/confirm`, {
          imageId: uploadData.imageId || file.name,
        });

        return newImage;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      queryClient.setQueryData<CollectionWithImages>(
        ["collection", collectionId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            images: [...old.images, ...uploadedImages],
          };
        }
      );

      queryClient.setQueryData<Collection[]>(["collections"], (old = []) =>
        old.map((c) =>
          c.id === collectionId
            ? { ...c, imageCount: c.imageCount + uploadedImages.length }
            : c
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (!collectionId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{data?.collection.title || "Collection"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploading
                    ? "Uploading..."
                    : "Click to upload images or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images will be compressed to 5MB max
                </p>
              </label>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading images...
              </div>
            ) : data?.images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No images in this collection yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Images ({data?.images.length || 0})
                </h3>
                <div className="space-y-2">
                  {data?.images.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {image.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(image.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {new Date(image.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteImageId(image.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="Delete image"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteImageId}
        onOpenChange={() => setDeleteImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteImageId) {
                  deleteMutation.mutate(deleteImageId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
