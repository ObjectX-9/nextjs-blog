// src/utils/serverCache.ts
import { cache } from 'react';

// 使用 React 的 cache 函数来缓存异步函数结果
export const createCachedFetcher = <T>(fetcher: () => Promise<T>) => {
    return cache(fetcher);
};