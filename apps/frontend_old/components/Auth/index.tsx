import { useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <div></div>;
  }

  return <>{children}</>;
};
