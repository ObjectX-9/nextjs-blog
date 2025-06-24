import { useState, useEffect, useCallback } from 'react';
import { IPhoto } from '@/app/model/photo';
import { photosBusiness } from '@/app/business/photos';
import { useLocalCache } from './useLocalCache';

// 缓存键常量
const CACHE_KEYS = {
    PHOTOS: 'album_photos',
    LAST_FETCH: 'album_last_fetch',
} as const;

// 缓存时间设置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
const REFRESH_INTERVAL = 30000; // 30秒

export interface UsePhotosReturn {
    photos: IPhoto[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const usePhotos = (): UsePhotosReturn => {
    const [photos, setPhotos] = useState<IPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getFromCache, setCache } = useLocalCache(CACHE_DURATION);

    const shouldFetchData = useCallback((): boolean => {
        const lastFetch = getFromCache<{ timestamp: number }>(CACHE_KEYS.LAST_FETCH);
        if (!lastFetch) return true;
        return Date.now() - lastFetch.timestamp > REFRESH_INTERVAL;
    }, [getFromCache]);

    const updateLastFetchTime = useCallback((): void => {
        setCache(CACHE_KEYS.LAST_FETCH, { timestamp: Date.now() });
    }, [setCache]);

    const fetchPhotos = useCallback(async (force: boolean = false) => {
        if (!force && !shouldFetchData()) {
            return;
        }

        try {
            setError(null);
            const fetchedPhotos = await photosBusiness.getPhotos();
            setPhotos(fetchedPhotos);
            setCache(CACHE_KEYS.PHOTOS, fetchedPhotos);
            updateLastFetchTime();
        } catch (err) {
            console.error('Error fetching photos:', err);

            // 如果请求失败，尝试使用缓存
            const cached = getFromCache<IPhoto[]>(CACHE_KEYS.PHOTOS);
            if (cached) {
                setPhotos(cached);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch photos');
            }
        } finally {
            setLoading(false);
        }
    }, [shouldFetchData, setCache, updateLastFetchTime, getFromCache]);

    // 公开的refetch方法
    const refetch = useCallback(() => fetchPhotos(true), [fetchPhotos]);

    useEffect(() => {
        // 首先尝试使用缓存数据
        const cached = getFromCache<IPhoto[]>(CACHE_KEYS.PHOTOS);
        if (cached && cached.length > 0) {
            setPhotos(cached);
            setLoading(false);
        }

        // 检查是否需要获取新数据
        fetchPhotos(true);

        // 每30秒尝试刷新一次
        const interval = setInterval(() => fetchPhotos(false), REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchPhotos, getFromCache]);

    return {
        photos,
        loading,
        error,
        refetch,
    };
}; 