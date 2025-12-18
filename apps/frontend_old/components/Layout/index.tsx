import Head from "next/head";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import Header from "../Header";

interface LayoutProps {
  children: ReactNode;
  page: {
    title: string;
    hideHeader?: boolean;
  };
  showNav?: boolean;
  isGame?: boolean;
}

export default function Layout({
  children,
  page,
  showNav = true,
  isGame = false,
}: LayoutProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${page.title} • datburnttt`}</title>
        <link rel="shortcut icon" href="/icons/logo.png" />
        <meta name="title" content="datburnt - keep some ice handy" />
        <meta
          name="description"
          content="A classic roast battle. Have fun with your friends and roast famous personalities!"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://datburnt.com/" />
        <meta property="og:title" content="datburnt - keep some ice handy" />
        <meta
          property="og:description"
          content="A classic roast battle. Have fun with your friends and roast famous personalities!"
        />
        <meta property="og:image" content="https://datburnt.com/banner.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://datburnt.com/" />
        <meta
          property="twitter:title"
          content="datburnt - keep some ice handy"
        />
        <meta
          property="twitter:description"
          content="A classic roast battle. Have fun with your friends and roast famous personalities!"
        />
        <meta
          property="twitter:image"
          content="https://datburnt.com/banner.png"
        />
      </Head>
      <div
        className="m-0 p-0 w-full h-[90vh] flex flex-col items-center pt-[10vh] bg-[#f4f4f4]"
        style={{
          background: `${
            router.pathname === "/"
              ? "linear-gradient(#e93131 0%, #680e0e 100%)"
              : ""
          }`,
        }}
      >
        {!page.hideHeader && showNav && (
          <Header
            type={`${router.pathname === "/" ? "light" : "dark"}`}
            code={isGame ? (router.query.code as string) : null}
          />
        )}
        <div className="w-full">{children}</div>
      </div>
      <div id="popupContainer"></div>
    </>
  );
}
