import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Logo from "../../public/icons/logo.png";
import PrimaryButton from "../Button/Primary";

interface HeaderProps {
  type?: "light" | "dark";
  code?: string | null;
}

export default function Header(props: HeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const _hostname = window.location.hostname;
    }
  }, []);

  return (
    <div className="absolute top-2 left-0 z-10 w-[96vw] ml-[2vw] h-[10vh] flex flex-row justify-between items-center">
      <div className="flex justify-center items-center">
        <Image src={Logo} height={50} width={50} alt="Logo" />
        <h1
          style={{ color: `${props.type === "light" ? "#ffffff" : ""}` }}
          className="text-2xl font-extrabold ml-6 text-[#4a4a4a] italic"
        >
          datburnttt
        </h1>
      </div>
      <div className="flex items-center">
        {router.pathname === "/home" ? (
          <>Play</>
        ) : router.pathname === "/" ? (
          <div>
            <PrimaryButton
              style={{ marginRight: "2rem" }}
              onClick={() => {
                setLoading(true);
                if (router.pathname === "/register") {
                  return setLoading(false);
                }
                router.push("/register");
              }}
              loading={loading}
            >
              Register
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setLoading(true);
                if (router.pathname === "/login") {
                  return setLoading(false);
                }
                router.push("/login");
              }}
              loading={loading}
            >
              Login
            </PrimaryButton>
          </div>
        ) : router.pathname === "/login" || router.pathname === "/register" ? (
          <PrimaryButton
            onClick={() => {
              setLoading(true);
              if (router.pathname === "/register") {
                return setLoading(false);
              }
              router.push("/register");
            }}
            loading={loading}
          >
            Start a fire!
          </PrimaryButton>
        ) : props.code ? (
          <div
            className="text-lg font-semibold mr-6 text-[#4a4a4a] cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/${router.query.code}`
              );
            }}
          >
            {window.location.host}/{router.query.code}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
