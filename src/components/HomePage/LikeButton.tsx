'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { debounce } from 'lodash-es';

function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取值
  const getStoredValue = useCallback(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`读取本地存储出错 (${key}):`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // 设置值
  const setStoredValue = useCallback((value: T) => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`写入本地存储出错 (${key}):`, error);
    }
  }, [key]);

  return { getStoredValue, setStoredValue };
}

// 点赞图标组件
const LikeIcon = ({ isLiked, isLiking }: { isLiked: boolean; isLiking: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill={isLiked ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={isLiking ? "animate-pulse" : ""}
    aria-hidden="true"
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
  </svg>
);

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
}

interface Article {
  _id?: string;
  likes: number;
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // 使用自定义钩子管理本地存储
  const likedStorage = useLocalStorage(`liked_${articleId}`, false);
  const likesStorage = useLocalStorage(`likes_count_${articleId}`, initialLikes);

  // 初始化状态
  useEffect(() => {
    const liked = likedStorage.getStoredValue();
    setIsLiked(liked);

    const storedLikes = likesStorage.getStoredValue();
    if (storedLikes > initialLikes) {
      setLikes(storedLikes);
    }
  }, [articleId, initialLikes, likedStorage, likesStorage]);

  // 防抖处理的点赞请求函数
  const sendLikeRequest = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return { success: true, likes: data.likes };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { success: false, error: '请求超时' };
      }
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }, [articleId]);

  // 更新缓存中的文章点赞数
  const updateCachedArticles = useCallback((newLikes: number) => {
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('docs_articles_'));

      cacheKeys.forEach(key => {
        try {
          const cachedData = localStorage.getItem(key);
          if (!cachedData) return;

          const parsed = JSON.parse(cachedData);
          if (!parsed.data || !Array.isArray(parsed.data)) return;

          const updatedArticles = parsed.data.map((article: Article) => {
            if (article._id?.toString() === articleId) {
              return { ...article, likes: newLikes };
            }
            return article;
          });

          localStorage.setItem(
            key,
            JSON.stringify({
              data: updatedArticles,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          console.error('更新缓存条目错误:', e);
        }
      });
    } catch (error) {
      console.error('更新缓存总体错误:', error);
    }
  }, [articleId]);

  // 使用防抖处理的点赞函数
  const debouncedLike = useMemo(
    () => debounce(async () => {
      if (isLiked || isLiking) return;

      setIsLiking(true);
      const result = await sendLikeRequest();

      if (result.success) {
        const newLikes = result.likes || likes + 1;
        setLikes(newLikes);
        setIsLiked(true);
        likedStorage.setStoredValue(true);
        likesStorage.setStoredValue(newLikes);
        updateCachedArticles(newLikes);
        message.success('点赞成功');
      } else {
        message.error(`点赞失败: ${result.error}`);
      }

      setIsLiking(false);
    }, 300),
    [isLiked, isLiking, likes, sendLikeRequest, likedStorage, likesStorage, updateCachedArticles]
  );

  // 处理点赞事件
  const handleLike = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiked) {
      message.info('您已经点过赞了');
      return;
    }

    debouncedLike();
  }, [isLiked, debouncedLike]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleLike(e);
    }
  }, [handleLike]);

  return (
    <span
      className={`flex items-center gap-1 ${isLiking ? 'opacity-50' : 'cursor-pointer'}`}
      onClick={handleLike}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isLiked}
      aria-label={isLiked ? "已点赞" : "点赞"}
      title={isLiked ? "您已经点过赞了" : "点赞支持"}
      data-testid="like-button"
    >
      <LikeIcon isLiked={isLiked} isLiking={isLiking} />
      <span>{likes}</span>
    </span>
  );
}