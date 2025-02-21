import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/notion-scrollbar.css";
import SiteProvider from "@/components/providers/SiteProvider";
import { getDb } from "@/lib/mongodb";
import LayoutWrapper from "@/components/LayoutWrapper";
import GoogleTagManagerHead from '@/components/GoogleTagManagerHead';
import GoogleTagManagerBody from '@/components/GoogleTagManagerBody';

const inter = Inter({ subsets: ["latin"] });

async function getSiteInfo() {
  try {
    const db = await getDb();
    const siteInfo = await db.collection("sites").findOne();
    return siteInfo;
  } catch (error) {
    console.error("Error fetching site info:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getSiteInfo();

  return {
    title: siteInfo?.title || "ObjectX's blog",
    description:
      siteInfo?.seo?.description ||
      "ObjectX's articles about programming and life",
    keywords: siteInfo?.seo?.keywords || [],
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
