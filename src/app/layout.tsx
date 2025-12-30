import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  title: 'Garuchan Land（ガルちゃんランド） | AIと笑いで遊ぶテーマパークメディア',
  description:
    'Garuchan Land（ガルちゃんランド）は、AIとユーモアで楽しむ新感覚エンタメテーマパーク。生成AI、ゲーム、アニメ、小説など、ワクワクするコンテンツを独自視点で発信。',
  keywords:
    'ガルちゃんランド, Garuchan Land, Garoop, ゲーム, AI, 生成AI, 地方創生, エンタメ, 教育, 山下大貴',
  alternates: {
    canonical: 'https://www.ai-garoop-novel.com/',
  },
  openGraph: {
    title: 'Garuchan Land（ガルちゃんランド）',
    description:
      'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
    url: 'https://www.ai-garoop-novel.com/',
    siteName: 'Garuchan Land',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/summary_image/garoop_ai_land.webp',
        width: 1200,
        height: 630,
        alt: 'Garuchan Land',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garuchan Land（ガルちゃんランド）',
    description:
      'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
    images: ['https://d3ez7mat4qd439.cloudfront.net/summary_image/garoop_ai_land.webp'],
  },
};

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import GaPageView from "@/components/GaPageView";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { Suspense } from "react";

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
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false,
                  app_name: 'garoop_novel'
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <GaPageView />
        </Suspense>
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
