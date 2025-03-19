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

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDb();
  const site = await db.collection("sites").findOne({});

  return {
    title: site?.title || "ObjectX's blog",
    description:
      site?.seo?.description || "ObjectX's articles about programming and life",
    keywords: site?.seo?.keywords || [],
    openGraph: {
      title: site?.title || "ObjectX's blog2132132132",
      siteName: "ObjectX 博客",
      description: site?.seo?.description || "ObjectX's articles about programming and life",
      type: "website",
    },
    other:
      site?.isOpenAdsense && site?.googleAdsenseId
        ? {
            "google-adsense-account": `ca-pub-${site.googleAdsenseId}`,
          }
        : {},
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManagerHead />
      </head>
      <body className={`${cn(inter.className)} h-dvh w-dvw`}>
        <SiteProvider>
          <GoogleTagManagerBody />
          <LayoutWrapper>{children}</LayoutWrapper>
        </SiteProvider>
      </body>
    </html>
  );
}
