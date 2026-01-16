import { Link } from "@tanstack/react-router";
import { PrimaryButton } from "../ui/button";

interface ErrorScreenProps {
  error: string;
}

export function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Oops!</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
      <Link to="/">
        <PrimaryButton>Back to Home</PrimaryButton>
      </Link>
    </div>
  );
}
