import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/apiClient";
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
import { PrimaryButton } from "@/components/ui/button";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { EditCollectionModal } from "./EditCollectionModal";
import { CollectionModal } from "./CollectionModal";
import { PlusIcon, Edit2Icon, TrashIcon, FolderIcon } from "lucide-react";
import type { Collection } from "@/types/collection";

export function CollectionsList() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null
  );

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await apiClient.get<Collection[]>("/collection");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      await apiClient.delete(`/collection/${collectionId}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Collection[]>(["collections"], (old = []) =>
        old.filter((c) => c.id !== deletedId)
      );
      setDeleteCollectionId(null);
    },
  });

  const handleEditClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setEditModalOpen(true);
  };

  const handleViewClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setCollectionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading collections...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Collections</h2>
          <PrimaryButton
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Collection
          </PrimaryButton>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground mb-4">
              No collections yet. Create your first collection to get started.
            </p>
            <PrimaryButton onClick={() => setCreateModalOpen(true)}>
              Create Collection
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleViewClick(collection)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {collection.imageCount || 0} images •{" "}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(collection);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                    title="Edit collection"
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCollectionId(collection.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                    title="Delete collection"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCollectionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      {selectedCollection && (
        <EditCollectionModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          collection={selectedCollection}
        />
      )}
      <CollectionModal
        open={collectionModalOpen}
        onOpenChange={setCollectionModalOpen}
        collectionId={selectedCollection?.id || null}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCollectionId}
        onOpenChange={() => setDeleteCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This will also
              delete all images in the collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCollectionId) {
                  deleteMutation.mutate(deleteCollectionId);
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
