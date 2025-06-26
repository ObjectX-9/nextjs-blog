import { useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash-es';

interface UseInfiniteScrollProps {
    /**
     * 是否还有更多
     */
    hasMore: boolean;
    /**
     * 是否正在加载更多
     */
    isLoadingMore: boolean;
    /**
     * 加载更多
     */
    loadMore: () => void;
    /**
     * 触发加载的阈值
     */
    threshold?: number;
    /**
     * 防抖时间
     */
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

    // 创建检查滚动位置的函数
    const checkScrollPosition = useCallback(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer || !hasMore || isLoadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // 当滚动到底部附近时触发加载更多
        // 已经滚动的距离 + 当前视口的高度 >= 总高度 - 触发加载的阈值
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore, threshold]);

    // 创建防抖的滚动处理函数
    const debouncedHandleScroll = useCallback(
        debounce(checkScrollPosition, debounceMs),
        [checkScrollPosition, debounceMs]
    );

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", debouncedHandleScroll, { passive: true });

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
                scrollContainer.removeEventListener("scroll", debouncedHandleScroll);
            }
            // 清理防抖函数
            debouncedHandleScroll.cancel();
        };
    }, [debouncedHandleScroll, hasMore, isLoadingMore, loadMore]);

    return scrollContainerRef;
}; 