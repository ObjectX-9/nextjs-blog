import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { IInspiration } from "@/app/model/inspiration";
import { inspirationsBusiness } from "@/app/business/inspirations";
import { useLocalCache } from "@/app/hooks/useLocalCache";

const CACHE_KEYS = {
    LIKED_INSPIRATIONS: 'likedInspirations',
};

export const useInspirations = () => {
    const [inspirations, setInspirations] = useState<IInspiration[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [likedInspirations, setLikedInspirations] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const { getFromCache, setCache } = useLocalCache();

    // 初始化点赞状态
    useEffect(() => {
        const storedLikedInspirations = getFromCache<string[]>(CACHE_KEYS.LIKED_INSPIRATIONS) || [];
        if (storedLikedInspirations.length > 0) {
            setLikedInspirations(new Set(storedLikedInspirations));
        }
    }, [getFromCache]);

    // 初始加载数据
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await inspirationsBusiness.getInspirations(1, 10);
                setInspirations(result.data as IInspiration[]);
                setHasMore(result.data.length === 10);
                setPage(1);
            } catch (error) {
                console.error("Failed to fetch inspirations:", error);
                setError("加载灵感笔记失败，请稍后重试");
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const loadMoreInspirations = useCallback(async () => {
        if (!hasMore || isLoadingMore) return;

        setIsLoadingMore(true);
        setError(null);
        const nextPage = page + 1;

        try {
            const result = await inspirationsBusiness.getInspirations(nextPage, 10);

            // 避免重复数据
            const newData = result.data as IInspiration[];
            const existingIds = new Set(inspirations.map(item => item._id));
            const uniqueNewData = newData.filter(item => !existingIds.has(item._id));

            if (uniqueNewData.length > 0) {
                setInspirations(prev => [...prev, ...uniqueNewData]);
                setPage(nextPage);
            }

            setHasMore(newData.length === 10);
        } catch (error) {
            console.error("Failed to fetch more inspirations:", error);
            setError("加载更多失败，请稍后重试");
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, page, inspirations]);

    const handleLike = useCallback(
        async (inspirationId: string) => {
            if (likedInspirations.has(inspirationId)) return;

            try {
                const response = await inspirationsBusiness.updateInspirationStats(inspirationId, "like");

                if (response) {
                    const updatedLikedInspirations = new Set(likedInspirations);
                    updatedLikedInspirations.add(inspirationId);
                    setLikedInspirations(updatedLikedInspirations);

                    const likedArray = Array.from(updatedLikedInspirations);
                    setCache(CACHE_KEYS.LIKED_INSPIRATIONS, likedArray);

                    setInspirations((prevInspirations) =>
                        prevInspirations.map((inspiration) =>
                            inspiration._id === inspirationId
                                ? { ...inspiration, likes: (inspiration.likes || 0) + 1 }
                                : inspiration
                        )
                    );
                    message.success("点赞成功");
                }
            } catch (error) {
                console.error("Failed to like inspiration:", error);
                message.error("点赞失败，请稍后重试");
            }
        },
        [likedInspirations, setCache]
    );

    const handleView = useCallback(
        async (inspirationId: string) => {
            try {
                const response = await inspirationsBusiness.updateInspirationStats(inspirationId, "view");

                if (response) {
                    setInspirations((prevInspirations) =>
                        prevInspirations.map((inspiration) =>
                            inspiration._id === inspirationId
                                ? { ...inspiration, views: (inspiration.views || 0) + 1 }
                                : inspiration
                        )
                    );
                }
            } catch (error) {
                console.error("Failed to record view:", error);
            }
        },
        []
    );

    const hasLiked = useCallback(
        (inspirationId: string) => likedInspirations.has(inspirationId),
        [likedInspirations]
    );

    const retry = useCallback(() => {
        setError(null);
        setHasMore(true);
        loadMoreInspirations();
    }, [loadMoreInspirations]);

    return {
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
    };
}; 