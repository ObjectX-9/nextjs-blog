'use client';

import { useSiteStore } from '@/store/site';

export default function GoogleTagManagerBody() {
  const { site } = useSiteStore();
  
  if (!site?.googleTagManagerId) return null;

  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${site.googleTagManagerId}`}
        height="0" 
        width="0" 
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
