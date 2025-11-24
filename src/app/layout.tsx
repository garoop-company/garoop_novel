import type { Metadata } from "next";
import "./globals.css";


// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  title: 'Garuchan News（ガルちゃんニュース） | AIと笑いで読む面白ニュースメディア',
  description:
    'Garuchan News（ガルちゃんニュース）は、AIとユーモアで時代を読み解く新感覚ニュースメディア。生成AI、地方創生、エンタメ、教育、政治、社会トレンドを独自視点で発信。',
  keywords:
    'ガルちゃんニュース, Garuchan News, Garoop, 面白ニュース, AIニュース, 生成AI, 地方創生, エンタメ, 教育, 政治, 社会, 山下大貴',
  alternates: {
    canonical: 'https://garoop.jp/news',
  },
  openGraph: {
    title: 'Garuchan News（ガルちゃんニュース）',
    description:
      'AIと笑いで読む面白ニュースメディア｜Garoop公式',
    url: 'https://garoop.jp/news',
    siteName: 'Garuchan News',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp',
        width: 1200,
        height: 630,
        alt: 'Garuchan News',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garuchan News（ガルちゃんニュース）',
    description:
      'AIと笑いで読む面白ニュースメディア｜Garoop公式',
    images: ['https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp'],
  },
};

import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
        <meta name="icon" content="/icon.svg" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
