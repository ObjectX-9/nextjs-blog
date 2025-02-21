'use client';

import { useSiteStore } from '@/store/site';
import Script from 'next/script';

export default function GoogleAdsense() {
  const { site } = useSiteStore();
  
  if (!site?.googleAdsenseId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${site.googleAdsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
