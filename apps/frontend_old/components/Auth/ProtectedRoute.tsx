import { useRouter } from "next/router";
import { type ReactNode, useEffect, useState } from "react";
import axios from "../../utils/axios";
import { useUserStore } from "../../utils/userStore";
import Loader from "../Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  inverse?: boolean;
}

const ProtectedRoute = ({ children, inverse = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const { setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      axios.get("/auth/me").then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
          if (inverse) {
            router.push("/home");
          } else {
            setLoading(false);
          }
        } else {
          setUser(null);
          if (inverse) {
            setLoading(false);
          } else {
            router.push("/");
          }
        }
      });
    }
  }, [loading, inverse, router, setUser]);

  return (
    <div>
      {loading ? (
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loader center />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ProtectedRoute;
