import Sidepanel from "@/components/Sidepanel";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteProvider from "@/components/providers/SiteProvider";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "ObjectX's blog",
  description: "ObjectX's articles about programming and life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cn(inter.className)} h-dvh w-dvw`}>
        <SiteProvider>
          <div className="min-h-screen bg-white lg:flex">
            <Sidepanel></Sidepanel>
            <div className="flex flex-1">{children}</div>
          </div>
        </SiteProvider>
      </body>
    </html>
  );
}
