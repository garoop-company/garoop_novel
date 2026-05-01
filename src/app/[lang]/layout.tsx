import type { Metadata } from "next";
import { locales, Locale } from "@/locales";
import Script from "next/script";
import "./globals.css";
import { generateLocalizedMetadata } from "@/lib/seo";

// ✅ メタデータ（SEO対策）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

  return generateLocalizedMetadata({
    title: 'Garoop Novel | 生成AIと赤ちゃんランド',
    description: 'Garoop Novelは、生成AIと赤ちゃんが大暴れする新感覚エンタメテーマパーク。AI、アニメ、小説など、ワクワクするコンテンツを発信中。',
    lang,
    path: '/',
    image: 'https://d3ez7mat4qd439.cloudfront.net/summary_image/garoop_ai_land.webp',
  });
}

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GaPageView from "@/components/GaPageView";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { Suspense } from "react";
import { BabyCompanion } from "@/components/BabyCompanion";
import { BackToBabyButton } from "./BackToBabyButton";

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
        <BabyCompanion />
        <div className="flex-grow pb-20 md:pb-0">
          {children}
        </div>
        <Footer lang={lang} />
        <BottomNav />
        <BackToBabyButton />
      </body>
    </html>
  );
}
