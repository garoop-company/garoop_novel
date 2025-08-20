import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tales of Shadow and Cipher",
  description: "A collection of horror and spy stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
