import React, { memo } from 'react';
import { useSiteStore } from "@/store/site";
import InspirationSkeleton from "@/components/inspirations/InspirationSkeleton";
import { InspirationItem } from "./components/InspirationItem";
import { useInspirations } from "./hooks/useInspirations";
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const LoadingSpinner = memo(() => (
    <div className="text-center text-gray-500 py-4">
        <div
            className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-blue-600 rounded-full"
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const EmptyState = memo(() => (
    <div className="text-center text-gray-500 py-6 text-sm">暂无灵感笔记</div>
));

EmptyState.displayName = 'EmptyState';

const NoMoreData = memo(() => (
    <div className="text-center text-gray-500 py-4 text-sm">
        没有更多灵感笔记了
    </div>
));

NoMoreData.displayName = 'NoMoreData';

const ErrorRetry = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center text-red-500 py-4 px-4">
        <p className="text-sm">{error}</p>
        <button
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
            重试
        </button>
    </div>
));

ErrorRetry.displayName = 'ErrorRetry';

export const MobileInspirationsView = memo(() => {
    const { site } = useSiteStore();
    const {
        inspirations,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMoreInspirations,
        handleLike,
        handleView,
        hasLiked,
        retry,
    } = useInspirations();

    const scrollContainerRef = useInfiniteScroll({
        hasMore,
        isLoadingMore,
        loadMore: loadMoreInspirations,
        threshold: 80, // 移动端稍微调小阈值
    });

    if (isLoading) {
        return <InspirationSkeleton itemCount={4} />;
    }

    return (
        <main className="flex-1 h-screen overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto custom-scrollbar-thin px-4 py-4"
            >
                <div className="w-full max-w-2xl mx-auto">
                    <header className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">
                            灵感笔记
                        </h1>
                        <p className="text-sm text-gray-600">
                            记录生活中的灵感和想法
                        </p>
                    </header>

                    <div className="space-y-4">
                        {inspirations.map((inspiration) => (
                            <InspirationItem
                                key={inspiration._id || ''}
                                inspiration={inspiration}
                                onLike={handleLike}
                                onView={handleView}
                                hasLiked={hasLiked(inspiration._id || '')}
                                site={site}
                                isMobile={true}
                            />
                        ))}
                    </div>

                    {inspirations.length === 0 && <EmptyState />}

                    {error && <ErrorRetry error={error} onRetry={retry} />}

                    {isLoadingMore && <LoadingSpinner />}

                    {!hasMore && inspirations.length > 0 && <NoMoreData />}
                </div>
            </div>
        </main>
    );
});

MobileInspirationsView.displayName = 'MobileInspirationsView'; 