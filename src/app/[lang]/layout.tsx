import type { Metadata, Viewport } from "next";
import { locales, Locale } from "@/locales";
import Script from "next/script";
import "./globals.css";
import { generateLocalizedMetadata } from "@/lib/seo";

// ✅ メタデータ（SEO対策）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

  const metadata: Metadata = generateLocalizedMetadata({
    title: 'Garoop Novel | 生成AIと赤ちゃんランド',
    description: 'Garoop Novelは、生成AIと赤ちゃんが大暴れする新感覚エンタメテーマパーク。AI、アニメ、小説など、ワクワクするコンテンツを発信中。',
    lang,
    path: '/',
  });

  return {
    ...metadata,
    applicationName: 'Garoop Novel',
    // iOS で「ホーム画面に追加」したときの表示。
    // manifest（src/app/manifest.ts）は iOS では一部しか読まれないので、こちらでも指定する。
    appleWebApp: {
      capable: true,
      title: 'Garoop Novel',
      statusBarStyle: 'black-translucent',
    },
    // apple-touch-icon と favicon は src/app/apple-icon.png・icon.png・favicon.ico から
    // Next.js が自動で <link> を出す（ファイル規約）。ここで icons を書くと二重になる。
  };
}

// アドレスバー・ステータスバーの色。ヘッダーの背景（rgba(10,8,7,...)）に合わせる。
// manifest の theme_color と同じ値にしておくこと。
export const viewport: Viewport = {
  themeColor: '#0a0807',
  colorScheme: 'dark',
};

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GaPageView from "@/components/GaPageView";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { Suspense } from "react";
import { BabyCompanion } from "@/components/BabyCompanion";
import { FloatingBabyChat } from "@/components/FloatingBabyChat";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { MotionProvider } from "@/components/MotionProvider";

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
        <meta name="icon" content="/favicon.ico" />
        {/* globals.css の @import で読む Google Fonts へ、CSS を待たずに先に接続しておく */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <MotionProvider>
          <Header />
          <BabyCompanion />
          <FloatingBabyChat />
          <div className="flex-grow pb-20 md:pb-0">
            {children}
          </div>
          <Footer lang={lang} />
          <BottomNav />
        </MotionProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
