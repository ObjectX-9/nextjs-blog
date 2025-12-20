'use client';

import Giscus from '@giscus/react';

interface GiscusCommentsProps {
    className?: string;
    isOpenGiscus?: boolean;
    giscusRepo?: string;
    giscusRepoId?: string;
    giscusCategory?: string;
    giscusCategoryId?: string;
}

export default function GiscusComments({
    className,
    isOpenGiscus,
    giscusRepo,
    giscusRepoId,
    giscusCategory,
    giscusCategoryId,
}: GiscusCommentsProps) {
    // 如果未开启或缺少必要配置，不渲染评论组件
    if (!isOpenGiscus || !giscusRepo || !giscusRepoId || !giscusCategoryId) {
        return null;
    }

    return (
        <div className={`mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 ${className || ''}`}>
            <Giscus
                id="comments"
                repo={giscusRepo as `${string}/${string}`}
                repoId={giscusRepoId}
                category={giscusCategory}
                categoryId={giscusCategoryId}
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
