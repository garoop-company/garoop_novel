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
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7714651880162273"
          crossOrigin="anonymous"></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
