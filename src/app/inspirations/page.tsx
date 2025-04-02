"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { InspirationDocument } from "@/app/model/inspiration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteStore } from "@/store/site";
import { ISite } from "../model/site";
import { useLocalCache } from "@/app/hooks/useLocalCache";
import BilibiliPlayer from "@/components/inspirations/BilibiliPlayer";
import ImageGallery from "@/components/inspirations/ImageGallery";
import LinksList from "@/components/inspirations/LinksList";
import InspirationHeader from "@/components/inspirations/InspirationHeader";
import TagsList from "@/components/inspirations/TagsList";
import ActionButtons from "@/components/inspirations/ActionButtons";
import InspirationSkeleton from "@/components/inspirations/InspirationSkeleton";

// 缓存键常量
const CACHE_KEYS = {
  LIKED_INSPIRATIONS: 'likedInspirations',
};

// Web端灵感笔记组件
const WebInspiration = ({
  inspiration,
  onLike,
  onView,
  hasLiked,
  site,
}: {
  inspiration: InspirationDocument;
  onLike: (id: string) => void;
  onView: (id: string) => void;
  hasLiked: boolean;
  site: ISite | null;
}) => {
  const viewTimeoutRef = useRef<NodeJS.Timeout>();
  const hasViewedRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (hasViewedRef.current) return;

    viewTimeoutRef.current = setTimeout(() => {
      onView(inspiration._id.toString());
      hasViewedRef.current = true;
    }, 1000); // 1秒后触发浏览量增加
  }, [inspiration._id, onView]);

  const handleMouseLeave = useCallback(() => {
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col space-y-2 mb-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={site?.author?.avatar} alt={site?.author?.name} />
          <AvatarFallback>{(site?.author?.name)?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <InspirationHeader
            title={inspiration.title}
            createdAt={inspiration.createdAt}
            site={site}
            isMobile={false}
          >
            <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
              {inspiration.content}
            </p>
            {inspiration.bilibili && (
              <BilibiliPlayer
                bvid={inspiration.bilibili.bvid}
                page={inspiration.bilibili.page || 1}
                title={inspiration.bilibili.title}
                isMobile={false}
              />
            )}
            {inspiration.images && inspiration.images.length > 0 && (
              <ImageGallery images={inspiration.images} isMobile={false} />
            )}
            {inspiration.links && inspiration.links.length > 0 && (
              <LinksList links={inspiration.links} isMobile={false} />
            )}

            {inspiration.tags && inspiration.tags.length > 0 && (
              <TagsList tags={inspiration.tags} isMobile={false} />
            )}

            <ActionButtons
              inspirationId={inspiration._id.toString()}
              likes={inspiration.likes || 0}
              views={inspiration.views || 0}
              hasLiked={hasLiked}
              onLike={onLike}
              isMobile={false}
            />
          </InspirationHeader>
        </div>
      </div>
    </div>
  );
};

// 移动端灵感笔记组件
const MobileInspiration = ({
  inspiration,
  onLike,
  onView,
  hasLiked,
  site,
}: {
  inspiration: InspirationDocument;
  onLike: (id: string) => void;
  onView: (id: string) => void;
  hasLiked: boolean;
  site: ISite | null;
}) => {
  const viewTimeoutRef = useRef<NodeJS.Timeout>();
  const hasViewedRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (hasViewedRef.current) return;

    viewTimeoutRef.current = setTimeout(() => {
      onView(inspiration._id.toString());
      hasViewedRef.current = true;
    }, 1000); // 1秒后触发浏览量增加
  }, [inspiration._id, onView]);

  const handleMouseLeave = useCallback(() => {
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col space-y-2 mb-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={site?.author?.avatar} alt={site?.author?.name} />
          <AvatarFallback>{(site?.author?.name)![0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <InspirationHeader
            title={inspiration.title}
            createdAt={inspiration.createdAt}
            site={site}
            isMobile={true}
          >
            <p className="text-sm leading-relaxed mb-2 whitespace-pre-wrap break-words">
              {inspiration.content}
            </p>
            {inspiration.bilibili && (
              <BilibiliPlayer
                bvid={inspiration.bilibili.bvid}
                page={inspiration.bilibili.page || 1}
                title={inspiration.bilibili.title}
                isMobile={true}
              />
            )}
            {inspiration.images && inspiration.images.length > 0 && (
              <ImageGallery images={inspiration.images} isMobile={true} />
            )}
            {inspiration.links && inspiration.links.length > 0 && (
              <LinksList links={inspiration.links} isMobile={true} />
            )}

            {inspiration.tags && inspiration.tags.length > 0 && (
              <TagsList tags={inspiration.tags} isMobile={true} />
            )}

            <ActionButtons
              inspirationId={inspiration._id.toString()}
              likes={inspiration.likes || 0}
              views={inspiration.views || 0}
              hasLiked={hasLiked}
              onLike={onLike}
              isMobile={true}
            />
          </InspirationHeader>
        </div>
      </div>
    </div>
  );
};

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<InspirationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [likedInspirations, setLikedInspirations] = useState<Set<string>>(
    new Set()
  );
  const [isMobile, setIsMobile] = useState(false);
  const { site } = useSiteStore();
  const { getFromCache, setCache } = useLocalCache();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 初始化点赞状态
  useEffect(() => {
    const storedLikedInspirations = getFromCache<string[]>(CACHE_KEYS.LIKED_INSPIRATIONS) || [];
    if (storedLikedInspirations.length > 0) {
      setLikedInspirations(new Set(storedLikedInspirations));
    }
  }, [getFromCache]);

  const fetchInspirations = useCallback(async (currentPage: number, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(
        `/api/inspirations?page=${currentPage}&limit=10&sort=createdAt:desc`
      );
      const result = await response.json();

      if (isLoadMore) {
        setInspirations((prev) => [...prev, ...result.data]);
      } else {
        setInspirations(result.data);
      }

      setHasMore(result.data.length === 10);
    } catch (error) {
      console.error("Failed to fetch inspirations:", error);
      setHasMore(false);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // 只在首次加载时获取数据
    if (page === 1) {
      fetchInspirations(page);
    }
  }, [page, fetchInspirations]);

  const loadMoreInspirations = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInspirations(nextPage, true);
    }
  }, [hasMore, isLoadingMore, page, fetchInspirations]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // 当滚动到距离底部50px时触发加载
      if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !isLoadingMore) {
        loadMoreInspirations();
      }
    };

    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loadMoreInspirations]);

  const handleLike = useCallback(
    async (inspirationId: string) => {
      if (likedInspirations.has(inspirationId)) return;

      try {
        const response = await fetch(
          `/api/inspirations/${inspirationId}/stats`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "like" }),
          }
        );

        if (response.ok) {
          const updatedLikedInspirations = new Set(likedInspirations);
          updatedLikedInspirations.add(inspirationId);
          setLikedInspirations(updatedLikedInspirations);

          // 使用 useLocalCache 更新本地存储
          const likedArray = Array.from(updatedLikedInspirations);
          setCache(CACHE_KEYS.LIKED_INSPIRATIONS, likedArray);
          console.log('已保存点赞状态:', likedArray);

          // Update the inspirations list with the new like count
          setInspirations((prevInspirations) =>
            prevInspirations.map((inspiration) =>
              inspiration._id.toString() === inspirationId
                ? { ...inspiration, likes: (inspiration.likes || 0) + 1 }
                : inspiration
            )
          );
        }
      } catch (error) {
        console.error("Failed to like inspiration:", error);
      }
    },
    [likedInspirations, setCache]
  );

  const handleView = useCallback(
    async (inspirationId: string) => {
      try {
        const response = await fetch(
          `/api/inspirations/${inspirationId}/stats`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "view" }),
          }
        );

        if (response.ok) {
          setInspirations((prevInspirations) =>
            prevInspirations.map((inspiration) =>
              inspiration._id.toString() === inspirationId
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

  if (isLoading) {
    return <InspirationSkeleton itemCount={6} />;
  }

  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-4 py-4 sm:py-16"
      >
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-6">
            灵感笔记
          </h1>
          <div className="mb-4 sm:mb-6 last:mb-0 text-sm sm:text-base">
            记录生活中的灵感和想法
          </div>

          <div className="space-y-4 sm:space-y-6">
            {inspirations.map((inspiration) =>
              isMobile ? (
                <MobileInspiration
                  key={inspiration._id.toString()}
                  inspiration={inspiration}
                  onLike={handleLike}
                  onView={handleView}
                  hasLiked={likedInspirations.has(inspiration._id.toString())}
                  site={site}
                />
              ) : (
                <WebInspiration
                  key={inspiration._id.toString()}
                  inspiration={inspiration}
                  onLike={handleLike}
                  onView={handleView}
                  hasLiked={likedInspirations.has(inspiration._id.toString())}
                  site={site}
                />
              )
            )}
          </div>

          {inspirations.length === 0 && (
            <div className="text-center text-gray-500 py-8">暂无灵感笔记</div>
          )}

          {isLoadingMore && (
            <div className="text-center text-gray-500 py-4">
              <div
                className="animate-spin inline-block w-5 h-5 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          {!hasMore && inspirations.length > 0 && (
            <div className="text-center text-gray-500 py-4">
              没有更多灵感笔记了
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
