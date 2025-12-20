import React, { memo } from 'react';
import { useSiteStore } from "@/store/site";
import InspirationSkeleton from "@/components/inspirations/InspirationSkeleton";
import { InspirationItem } from "./components/InspirationItem";
import { useInspirations } from "./hooks/useInspirations";
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PageHeader from "@/components/PageHeader";

const LoadingSpinner = memo(() => (
    <div className="text-center text-gray-500 py-4">
        <div
            className="animate-spin inline-block w-5 h-5 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const EmptyState = memo(() => (
    <div className="text-center text-gray-500 py-8">暂无灵感笔记</div>
));

EmptyState.displayName = 'EmptyState';

const NoMoreData = memo(() => (
    <div className="text-center text-gray-500 py-4">
        没有更多灵感笔记了
    </div>
));

NoMoreData.displayName = 'NoMoreData';

const ErrorRetry = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center text-red-500 py-4">
        <p>{error}</p>
        <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
            重试
        </button>
    </div>
));

ErrorRetry.displayName = 'ErrorRetry';

export const WebInspirationsView = memo(() => {
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
    });

    if (isLoading) {
        return <InspirationSkeleton itemCount={6} />;
    }

    return (
        <main className="flex-1 h-screen overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto custom-scrollbar-thin px-4 py-16"
            >
                <div className="w-full max-w-3xl mx-auto">
                    <PageHeader
                        title="灵感笔记"
                        description="记录生活中的灵感和想法"
                    />

                    <div className="space-y-6">
                        {inspirations.map((inspiration) => (
                            <InspirationItem
                                key={inspiration._id || ''}
                                inspiration={inspiration}
                                onLike={handleLike}
                                onView={handleView}
                                hasLiked={hasLiked(inspiration._id || '')}
                                site={site}
                                isMobile={false}
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

WebInspirationsView.displayName = 'WebInspirationsView'; 