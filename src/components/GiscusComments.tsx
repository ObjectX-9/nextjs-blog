'use client';

import Giscus from '@giscus/react';

interface GiscusCommentsProps {
    className?: string;
}

export default function GiscusComments({ className }: GiscusCommentsProps) {
    return (
        <div className={`mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 ${className || ''}`}>
            <Giscus
                id="comments"
                repo="ObjectX-9/nextjs-blog"
                repoId="R_kgDONPpElg"
                category="Announcements"
                categoryId="DIC_kwDONPpEls4C0B5L"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme="preferred_color_scheme"
                lang="zh-CN"
                loading="lazy"
            />
        </div>
    );
}
