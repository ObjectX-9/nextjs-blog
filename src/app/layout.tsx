import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/notion-scrollbar.css";
import SiteProvider from "@/components/providers/SiteProvider";
import { getDb } from "@/lib/mongodb";
import LayoutWrapper from "@/components/LayoutWrapper";
import GoogleTagManagerHead from "@/components/GoogleTagManagerHead";
import GoogleTagManagerBody from "@/components/GoogleTagManagerBody";
import Loading from "./Loading";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDb();
  const site = await db.collection("sites").findOne({});
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ObjectX 博客-一个专注前端 & Ai的网站',
    url: 'https://object-x.net.cn',
    logo: site?.logo || 'https://object-x.net.cn/logo.png',
    sameAs: [
      site?.social?.github || 'https://github.com/objectx',
      // 其他社交媒体链接
    ]
  };
  return {
    title: site?.title || "ObjectX's blog",
    description:
      site?.seo?.description || "ObjectX's articles about programming and life",
    keywords: site?.seo?.keywords || [],
    openGraph: {
      title: 'ObjectX 博客’ 一个专注前端 & Ai的网站,',
      siteName: "ObjectX 博客",
      description: site?.seo?.description || "ObjectX's articles about programming and life",
      type: "website",
    },
    other: {
      ...site?.isOpenAdsense && site?.googleAdsenseId
        ? {
          "google-adsense-account": `ca-pub-${site.googleAdsenseId}`,
        }
        : {},
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "如何优化 Next.js 网站的 SEO",
  "author": {
    "@type": "Person",
    "name": "ObjectX"
  },
  "datePublished": "2025-03-18",
  "publisher": {
    "@type": "Organization",
    "name": "ObjectX 博客",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManagerHead />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className={`${cn(inter.className)} h-dvh w-dvw`}>
        <SiteProvider>
          <GoogleTagManagerBody />
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <LayoutWrapper>
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </LayoutWrapper>
            </AnalyticsProvider>
          </Suspense>
        </SiteProvider>
      </body>
    </html>
  );
}
