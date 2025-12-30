import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/button";
import { apiClient } from "@/utils/apiClient";
import { useUserStore } from "@/state/user";
import type { User } from "@/state/user";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const response = await apiClient.post<{
          success: boolean;
          user?: User;
          message?: string;
        }>("/user/login", {
          email,
          password,
        });

        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          onOpenChange(false);
          // Reset form
          setEmail("");
          setPassword("");
          setUsername("");
        } else {
          setError(response.data.message || "Login failed");
        }
      } else {
        const response = await apiClient.post<{
          success: boolean;
          userId?: number;
          message?: string;
        }>("/user/register", {
          username,
          email,
          password,
        });

        if (response.data.success) {
          // After registration, fetch the user data
          const meResponse = await apiClient.get<{
            success: boolean;
            user: User;
          }>("/user/me");

          if (meResponse.data.success) {
            setUser(meResponse.data.user);
            onOpenChange(false);
            // Reset form
            setEmail("");
            setPassword("");
            setUsername("");
          }
        } else {
          setError(response.data.message || "Registration failed");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Sign In" : "Register"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Sign in to your account to create rooms"
              : "Create a new account to get started"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && (
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
          )}

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <PrimaryButton type="submit" loading={loading} className="w-full">
            {mode === "login" ? "Sign In" : "Register"}
          </PrimaryButton>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-app-primary hover:underline font-semibold"
                >
                  Register now
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-app-primary hover:underline font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
