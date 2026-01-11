import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { RefreshCwIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { CollectionsList } from "@/components/CollectionsList";
import { EditUsernameModal } from "@/components/EditUsernameModal";
import { useUserStore, type User } from "@/state/user";
import { apiClient } from "@/utils/apiClient";

export const Route = createFileRoute("/my-account")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  component: MyAccountComponent,
});

function MyAccountComponent() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const [editUsernameOpen, setEditUsernameOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const regenerateAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{
        success: boolean;
        user?: User;
      }>("/user/avatar/regenerate");
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        queryClient.setQueryData(["user"], data.user);
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile
          </h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <img
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                className="w-24 h-24 rounded-full border-2 border-border"
              />
              <button
                onClick={() => regenerateAvatarMutation.mutate()}
                disabled={regenerateAvatarMutation.isPending}
                className="flex items-center gap-2 text-sm text-app-primary hover:text-app-primary-light disabled:opacity-50"
              >
                <RefreshCwIcon
                  className={`h-3 w-3 ${
                    regenerateAvatarMutation.isPending ? "animate-spin" : ""
                  }`}
                />
                {regenerateAvatarMutation.isPending
                  ? "Generating..."
                  : "Regenerate"}
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Username
                </p>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg">{user.email}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setEditUsernameOpen(true)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Edit Username
                </button>
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <CollectionsList />
        </div>
      </div>

      <EditUsernameModal
        open={editUsernameOpen}
        onOpenChange={setEditUsernameOpen}
      />
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
