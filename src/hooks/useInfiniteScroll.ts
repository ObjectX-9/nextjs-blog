import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    threshold?: number;
    debounceMs?: number;
}

export const useInfiniteScroll = ({
    hasMore,
    isLoadingMore,
    loadMore,
    threshold = 100,
    debounceMs = 150,
}: UseInfiniteScrollProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        const handleScroll = () => {
            if (!scrollContainer || !hasMore || isLoadingMore) return;

            // 清除之前的防抖定时器
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // 设置防抖
            debounceTimeoutRef.current = setTimeout(() => {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

                // 当滚动到底部附近时触发加载更多
                if (scrollTop + clientHeight >= scrollHeight - threshold) {
                    loadMore();
                }
            }, debounceMs);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

            // 检查初始内容是否需要加载更多
            setTimeout(() => {
                if (
                    scrollContainer.scrollHeight <= scrollContainer.clientHeight &&
                    hasMore &&
                    !isLoadingMore
                ) {
                    loadMore();
                }
            }, 100);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", handleScroll);
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [hasMore, isLoadingMore, loadMore, threshold, debounceMs]);

    return scrollContainerRef;
}; 