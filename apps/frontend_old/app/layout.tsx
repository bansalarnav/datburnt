import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "datburnt - keep some ice handy",
  description:
    "A classic roast battle. Have fun with your friends and roast famous personalities!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
