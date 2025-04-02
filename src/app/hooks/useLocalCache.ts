'use client';

import { useCallback } from 'react';

// 默认缓存时间：5分钟
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * 本地缓存钩子
 * @param cacheDuration 缓存持续时间（毫秒）
 * @returns 缓存操作方法
 */
export function useLocalCache(cacheDuration = DEFAULT_CACHE_DURATION) {
  /**
   * 从缓存中获取数据
   * @param key 缓存键名
   * @returns 缓存的数据或null
   */
  const getFromCache = useCallback(<T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > cacheDuration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`读取缓存出错 (${key}):`, error);
      return null;
    }
  }, [cacheDuration]);

  /**
   * 将数据存入缓存
   * @param key 缓存键名
   * @param data 要缓存的数据
   */
  const setCache = useCallback(<T>(key: string, data: T): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error(`写入缓存出错 (${key}):`, error);
    }
  }, []);

  /**
   * 清除指定键的缓存
   * @param key 缓存键名
   */
  const clearCache = useCallback((key: string): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`清除缓存出错 (${key}):`, error);
    }
  }, []);

  /**
   * 清除所有以前缀开头的缓存
   * @param prefix 缓存键前缀
   */
  const clearCacheByPrefix = useCallback((prefix: string): void => {
    if (typeof window === "undefined") return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(`清除前缀缓存出错 (${prefix}):`, error);
    }
  }, []);

  return {
    getFromCache,
    setCache,
    clearCache,
    clearCacheByPrefix
  };
}
