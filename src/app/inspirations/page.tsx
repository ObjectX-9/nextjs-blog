"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { InspirationDocument } from "@/app/model/inspiration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useSiteStore } from "@/store/site";

// Web端灵感笔记组件
const WebInspiration = ({ 
  inspiration, 
  onLike, 
  onView, 
  hasLiked,
  site 
}: { 
  inspiration: InspirationDocument;
  onLike: (id: string) => void;
  onView: (id: string) => void;
  hasLiked: boolean;
  site: any;
}) => {
  return (
    <div
      className="flex flex-col space-y-2 mb-8"
      onClick={() => onView(inspiration._id.toString())}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage
            src={site?.author?.avatar}
            alt={site?.author?.name}
          />
          <AvatarFallback>{(site?.author?.name)![0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {site?.author?.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(inspiration.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 p-4 inline-block max-w-full">
            <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
              {inspiration.content}
            </p>
            {inspiration.bilibili && (
              <div className="aspect-video w-full mb-3">
                <iframe 
                  src={`//player.bilibili.com/player.html?bvid=${inspiration.bilibili.bvid}&page=${inspiration.bilibili.page || 1}`}
                  scrolling="no" 
                  style={{ border: 'none' }}
                  frameBorder="no" 
                  allowFullScreen={true}
                  className="w-full h-full"
                />
              </div>
            )}
            {inspiration.images && inspiration.images.length > 0 && (
              <div className={`grid gap-2 mb-3 ${
                inspiration.images?.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
                inspiration.images?.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                'grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto'
              }`}>
                {inspiration.images?.slice(0, 4).map((img, index) => (
                  <div key={index} className={`relative aspect-square w-full h-full ${
                    inspiration.images?.length === 1 
                      ? 'min-h-[280px] sm:min-h-[320px] max-h-[400px]' 
                      : 'min-h-[160px] sm:min-h-[200px] max-h-[280px]'
                  }`}>
                    <Image
                      src={img}
                      alt={`Inspiration image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes={inspiration.images?.length === 1 
                        ? '(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 800px' 
                        : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 400px'}
                    />
                  </div>
                ))}
              </div>
            )}

            {inspiration.tags && inspiration.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {inspiration.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex space-x-4 text-gray-500 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(inspiration._id.toString());
                }}
                className={`flex items-center space-x-1 transition-colors ${
                  hasLiked
                    ? "text-red-500"
                    : "hover:text-red-500"
                }`}
              >
                <Heart
                  size={14}
                  fill={hasLiked ? "currentColor" : "none"}
                />
                <span>{inspiration.likes || 0}</span>
              </button>
              <button
                className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                disabled
              >
                <Eye size={14} />
                <span>{inspiration.views || 0}</span>
              </button>
            </div>
          </div>
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
  site 
}: { 
  inspiration: InspirationDocument;
  onLike: (id: string) => void;
  onView: (id: string) => void;
  hasLiked: boolean;
  site: any;
}) => {
  return (
    <div
      className="flex flex-col space-y-2 mb-4"
      onClick={() => onView(inspiration._id.toString())}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage
            src={site?.author?.avatar}
            alt={site?.author?.name}
          />
          <AvatarFallback>{(site?.author?.name)![0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm truncate">
              {site?.author?.name}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatDistanceToNow(new Date(inspiration.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 p-3 inline-block max-w-full">
            <p className="text-sm leading-relaxed mb-2 whitespace-pre-wrap break-words">
              {inspiration.content}
            </p>
            {inspiration.bilibili && (
              <div className="aspect-video w-full mb-2">
                <iframe 
                  src={`//player.bilibili.com/player.html?bvid=${inspiration.bilibili.bvid}&page=${inspiration.bilibili.page || 1}`}
                  scrolling="no" 
                  style={{ border: 'none' }}
                  frameBorder="no" 
                  allowFullScreen={true}
                  className="w-full h-full"
                />
              </div>
            )}
            {inspiration.images && inspiration.images.length > 0 && (
              <div className={`grid gap-1.5 mb-2 ${
                inspiration.images?.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                'grid-cols-2 max-w-md mx-auto'
              }`}>
                {inspiration.images?.slice(0, 4).map((img, index) => (
                  <div key={index} className={`relative aspect-square w-full h-full ${
                    inspiration.images?.length === 1 
                      ? 'min-h-[200px] max-h-[300px]' 
                      : 'min-h-[140px] max-h-[200px]'
                  }`}>
                    <Image
                      src={img}
                      alt={`Inspiration image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes={inspiration.images?.length === 1 
                        ? '(max-width: 640px) 85vw, 500px' 
                        : '(max-width: 640px) 42vw, 250px'}
                    />
                  </div>
                ))}
              </div>
            )}

            {inspiration.tags && inspiration.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {inspiration.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex space-x-4 text-gray-500 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(inspiration._id.toString());
                }}
                className={`flex items-center space-x-1 transition-colors ${
                  hasLiked
                    ? "text-red-500"
                    : "hover:text-red-500"
                }`}
              >
                <Heart
                  size={12}
                  fill={hasLiked ? "currentColor" : "none"}
                />
                <span>{inspiration.likes || 0}</span>
              </button>
              <button
                className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                disabled
              >
                <Eye size={12} />
                <span>{inspiration.views || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<InspirationDocument[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [likedInspirations, setLikedInspirations] = useState<Set<string>>(new Set());
  const [viewedInspirations, setViewedInspirations] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const { site } = useSiteStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchInspirations = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/inspirations?page=${pageNum}&limit=10&sort=createdAt:desc`
      );
      const result = await response.json();

      setInspirations(result.data);
      setTotalPages(result.pagination.totalPages);

      // Retrieve liked and viewed inspirations from localStorage
      const storedLikedInspirations = localStorage.getItem("likedInspirations");
      const storedViewedInspirations =
        localStorage.getItem("viewedInspirations");

      if (storedLikedInspirations) {
        setLikedInspirations(new Set(JSON.parse(storedLikedInspirations)));
      }
      if (storedViewedInspirations) {
        setViewedInspirations(new Set(JSON.parse(storedViewedInspirations)));
      }
    } catch (error) {
      console.error("Failed to fetch inspirations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations(page);
  }, [page]);

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
          const updatedLikedInspirations = new Set(likedInspirations).add(
            inspirationId
          );
          setLikedInspirations(updatedLikedInspirations);

          // Update localStorage
          localStorage.setItem(
            "likedInspirations",
            JSON.stringify(Array.from(updatedLikedInspirations))
          );

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
    [likedInspirations]
  );

  const handleView = useCallback(
    async (inspirationId: string) => {
      if (viewedInspirations.has(inspirationId)) return;

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
          const updatedViewedInspirations = new Set(viewedInspirations).add(
            inspirationId
          );
          setViewedInspirations(updatedViewedInspirations);

          // Update localStorage
          localStorage.setItem(
            "viewedInspirations",
            JSON.stringify(Array.from(updatedViewedInspirations))
          );

          // Update the inspirations list with the new view count
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
    [viewedInspirations]
  );

  useEffect(() => {
    // Automatically record view for each inspiration when it first appears
    inspirations.forEach((inspiration) => {
      const inspirationId = inspiration._id.toString();
      // Check if the inspiration has not been viewed in the current session
      if (!viewedInspirations.has(inspirationId)) {
        // Attempt to get view tracking from localStorage to prevent multiple views
        const viewedInspirationsInStorage =
          localStorage.getItem("viewedInspirations");
        const storedViewedInspirations = viewedInspirationsInStorage
          ? new Set(JSON.parse(viewedInspirationsInStorage))
          : new Set();

        if (!storedViewedInspirations.has(inspirationId)) {
          handleView(inspirationId);
        }
      }
    });
  }, [inspirations, viewedInspirations, handleView]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 h-screen overflow-hidden">
        <div className="h-full overflow-y-auto px-4 sm:px-4 py-4 sm:py-16">
          <div className="w-full max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8">
                  <div className="h-24 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto px-4 py-4 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-6">
            灵感笔记
          </h1>
          <div className="mb-4 sm:mb-6 last:mb-0 text-sm sm:text-base">
            记录生活中的灵感和想法
          </div>

          <div className="space-y-4 sm:space-y-6">
            {inspirations.map((inspiration) => (
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
            ))}
          </div>

          {inspirations.length === 0 && (
            <div className="text-center text-gray-500 py-8">暂无灵感笔记</div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
