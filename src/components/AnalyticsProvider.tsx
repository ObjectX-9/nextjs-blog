'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics, trackPageView } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 初始化（后台页面不初始化）
    useEffect(() => {
        if (pathname?.startsWith('/admin')) return;

        analytics.init();

        return () => {
            analytics.destroy();
        };
    }, [pathname]);

    // 路由变化时记录页面访问（后台页面不记录）
    useEffect(() => {
        if (pathname?.startsWith('/admin')) return;

        trackPageView(pathname);
    }, [pathname, searchParams]);

    return <>{children}</>;
}
