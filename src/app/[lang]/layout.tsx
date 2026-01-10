import type { Metadata } from "next";
import { locales, Locale } from "@/locales";
import Script from "next/script";
import "./globals.css";
// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  title: 'カンガルーの遊園地 | 生成AIと赤ちゃんランド',
  description:
    'カンガルーの遊園地（ガルちゃんランド）は、生成AIと赤ちゃんが大暴れする新感覚エンタメテーマパーク。AI、ゲーム、アニメ、小説など、ワクワクするコンテンツを発信中。',
  keywords:
    'カンガルーの遊園地, 赤ちゃんランド, ガルちゃんランド, Garuchan Land, Garoop, ゲーム, AI, 生成AI, 教育, 山下大貴',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png',
  },
  metadataBase: new URL('https://garoop.jp'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'カンガルーの遊園地（ガルちゃんランド）',
    description:
      '生成AIと赤ちゃんが主役のエンタメメディア｜Garoop公式',
    url: 'https://garoop.jp',
    siteName: 'カンガルーの遊園地',
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
    title: 'カンガルーの遊園地（ガルちゃんランド）',
    description:
      '生成AIと赤ちゃんが主役のエンタメメディア｜Garoop公式',
    images: ['https://www.ai-garoop-novel.com/images/garuchan_island_map.png'],
  },
};

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GaPageView from "@/components/GaPageView";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { Suspense } from "react";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  return (
    <html lang={lang}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7714651880162273"
          crossOrigin="anonymous"></script>
        <meta name="icon" content="/favicon.ico" />
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
        <div className="flex-grow pb-20 md:pb-0">
          {children}
        </div>
        <Footer lang={lang} />
        <BottomNav />
      </body>
    </html>
  );
}
