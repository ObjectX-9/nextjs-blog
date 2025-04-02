"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IBookmark, IBookmarkCategory } from "../model/bookmark";
import { useLocalCache } from "@/app/hooks/useLocalCache";
import { BookmarksSkeleton } from "@/components/bookmarks/BookmarksSkeleton";
import { RssIcon } from "@/components/icons/RssIcon";

// 缓存键常量
const CACHE_KEYS = {
  CATEGORIES: "bookmark_categories",
  BOOKMARKS: "bookmark_bookmarks_",
  SCREENSHOTS: "bookmark_screenshots",
  LAST_FETCH: "bookmark_last_fetch_",
};

// 缓存时间设置（30分钟）
const CACHE_DURATION = 30 * 60 * 1000;

// 获取有效的主机名
const getHostname = (url: string): string => {
  try {
    // 检查 URL 是否包含协议
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    return new URL(url).hostname;
  } catch (error) {
    // 如果 URL 无效，返回原始 URL 或其一部分
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
};

export default function Bookmarks() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<IBookmarkCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [showMobileList, setShowMobileList] = useState(false);
  const [categoryBookmarkCounts, setCategoryBookmarkCounts] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // 引用滚动容器
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  const { getFromCache, setCache } = useLocalCache(CACHE_DURATION);

  // 提取获取分类的函数
  const fetchCategories = useCallback(async () => {
    try {
      console.log("Fetching categories...");
      const cachedCategories = getFromCache<IBookmarkCategory[]>(
        CACHE_KEYS.CATEGORIES
      );
      if (cachedCategories && Array.isArray(cachedCategories)) {
        console.log("Using cached categories:", cachedCategories);
        setCategories(cachedCategories);
        if (
          !selectedCategory &&
          cachedCategories.length > 0 &&
          cachedCategories[0]._id
        ) {
          setSelectedCategory(cachedCategories[0]._id.toString());
        }
        setIsLoading(false);
      }

      // 获取所有书签
      const bookmarksResponse = await fetch("/api/bookmarks");
      const bookmarksData = await bookmarksResponse.json();
      const bookmarkCounts: Record<string, number> = {};

      if (bookmarksData.success && Array.isArray(bookmarksData.bookmarks)) {
        console.log("Bookmarks data:", bookmarksData.bookmarks);
        bookmarksData.bookmarks.forEach((bookmark: IBookmark) => {
          // 确保 categoryId 是字符串形式
          const categoryId =
            typeof bookmark.categoryId === "string"
              ? bookmark.categoryId
              : bookmark.categoryId.toString();
          bookmarkCounts[categoryId] = (bookmarkCounts[categoryId] || 0) + 1;
        });
        console.log("Bookmark counts:", bookmarkCounts);
      }

      const response = await fetch("/api/bookmarks/categories");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          console.log("Categories data:", data.categories);
          const processedCategories = data.categories.map(
            (category: IBookmarkCategory) => {
              const categoryId =
                typeof category._id === "string"
                  ? category._id
                  : category._id!.toString();
              return {
                ...category,
                _id: categoryId,
              };
            }
          );

          console.log("Processed categories:", processedCategories);
          setCategories(processedCategories);
          setCache(CACHE_KEYS.CATEGORIES, processedCategories);
          setCategoryBookmarkCounts(bookmarkCounts);

          // Set initial selected category if none is selected
          if (
            !selectedCategory &&
            processedCategories.length > 0 &&
            processedCategories[0]._id
          ) {
            setSelectedCategory(processedCategories[0]._id);
          }
        } else {
          console.error("Invalid categories data format:", data);
          setCategories([]);
        }
      } else {
        console.error("Failed to fetch categories:", response.statusText);
        setCategories([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setIsLoading(false);
    }
  }, [selectedCategory, getFromCache, setCache]);

  // 初始加载和定时刷新分类
  useEffect(() => {
    console.log("Initial categories fetch");
    setIsLoading(true);
    fetchCategories();

    // 每30秒刷新一次分类
    const categoryInterval = setInterval(() => {
      console.log("Refreshing categories");
      fetchCategories();
    }, 30000);

    return () => clearInterval(categoryInterval);
  }, [fetchCategories]);

  // 提取获取书签的函数
  const fetchBookmarks = useCallback(
    async (categoryId: string) => {
      if (!categoryId) return;

      // 保存当前滚动位置
      const scrollPosition = {
        desktop: mainContentRef.current?.scrollTop || 0,
        mobile: mobileContentRef.current?.scrollTop || 0,
      };

      try {
        setIsLoading(true);
        const cacheKey = `${CACHE_KEYS.BOOKMARKS}${categoryId}`;
        const cachedBookmarks = getFromCache<IBookmark[]>(cacheKey);
        if (cachedBookmarks && Array.isArray(cachedBookmarks)) {
          setBookmarks(cachedBookmarks);
          setIsLoading(false);

          // 在下一个渲染周期恢复滚动位置
          setTimeout(() => {
            if (mainContentRef.current)
              mainContentRef.current.scrollTop = scrollPosition.desktop;
            if (mobileContentRef.current)
              mobileContentRef.current.scrollTop = scrollPosition.mobile;
          }, 0);
        }

        const response = await fetch(`/api/bookmarks?categoryId=${categoryId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.bookmarks)) {
            setBookmarks(data.bookmarks);
            setCache(cacheKey, data.bookmarks);
          } else {
            console.error("Invalid bookmarks data format:", data);
            setBookmarks([]);
          }
        } else {
          console.error("Failed to fetch bookmarks:", response.statusText);
          setBookmarks([]);
        }
        setIsLoading(false);

        // 在数据加载完成后恢复滚动位置
        setTimeout(() => {
          if (mainContentRef.current)
            mainContentRef.current.scrollTop = scrollPosition.desktop;
          if (mobileContentRef.current)
            mobileContentRef.current.scrollTop = scrollPosition.mobile;
        }, 0);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setBookmarks([]);
        setIsLoading(false);
      }
    },
    [getFromCache, setCache]
  );

  // 当选中的分类改变或定时刷新时获取书签
  useEffect(() => {
    if (selectedCategory) {
      fetchBookmarks(selectedCategory);

      // 每30秒刷新一次当前分类的书签
      const bookmarkInterval = setInterval(() => {
        fetchBookmarks(selectedCategory);
      }, 30000);

      return () => clearInterval(bookmarkInterval);
    }
  }, [selectedCategory, fetchBookmarks]);

  // Fetch screenshots with cache
  useEffect(() => {
    const fetchScreenshot = async (bookmark: IBookmark) => {
      if (screenshots[bookmark.url] || bookmark.imageUrl) return;

      // Try to get from cache first
      const cachedScreenshots = getFromCache<Record<string, string>>(
        CACHE_KEYS.SCREENSHOTS
      );
      if (cachedScreenshots && cachedScreenshots[bookmark.url]) {
        setScreenshots((prev) => ({
          ...prev,
          [bookmark.url]: cachedScreenshots[bookmark.url],
        }));
        return;
      }

      try {
        const response = await fetch(
          `/api/screenshot?url=${encodeURIComponent(bookmark.url)}`
        );
        const data = await response.json();

        if (data.screenshot) {
          setScreenshots((prev) => {
            const newScreenshots = {
              ...prev,
              [bookmark.url]: data.screenshot,
            };
            // Update cache
            setCache(CACHE_KEYS.SCREENSHOTS, newScreenshots);
            return newScreenshots;
          });
        }
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    };

    bookmarks.forEach(fetchScreenshot);
  }, [bookmarks, screenshots, getFromCache, setCache]);

  // Web layout
  const WebLayout = () => (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <nav className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">分类</h3>
            <Link
              href="/api/rss"
              target="_blank"
              className="text-orange-500 hover:text-orange-600 flex items-center"
              title="订阅全部书签"
            >
              <RssIcon className="w-4 h-4" isSelected={false} />
            </Link>
          </div>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <button
                key={category._id?.toString()}
                onClick={() =>
                  setSelectedCategory(category._id?.toString() || null)
                }
                className={`w-full text-left p-2 rounded-lg mb-2 ${
                  selectedCategory === category._id?.toString()
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm opacity-60 mr-2">
                      {categoryBookmarkCounts[category._id?.toString() || ""] ||
                        0}{" "}
                      个站点
                    </span>
                    {selectedCategory === category._id?.toString() && (
                      <Link
                        href={`/api/rss?categoryId=${category._id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-orange-500 hover:text-orange-600`}
                        title={`订阅 ${category.name} 分类`}
                      >
                        <RssIcon className="w-3 h-3" isSelected={true} />
                      </Link>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main
        ref={mainContentRef}
        className="flex-1 p-8 h-[100vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {Array.isArray(categories) &&
              categories.find((cat) => cat._id?.toString() === selectedCategory)
                ?.name}
          </h2>
          {selectedCategory && (
            <Link
              href={`/api/rss?categoryId=${selectedCategory}`}
              target="_blank"
              className="text-black-500 hover:text-orange-600 flex items-center"
              title="订阅当前分类"
            >
              <RssIcon className="w-5 h-5 mr-1" isSelected={false} />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 w-full overflow-auto-y">
          {Array.isArray(bookmarks) &&
            bookmarks.map((bookmark) => (
              <Link
                href={bookmark.url}
                key={bookmark._id?.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow w-full"
              >
                <div className="aspect-video bg-gray-100 p-4">
                  {(bookmark.imageUrl || screenshots[bookmark.url]) && (
                    <Image
                      src={bookmark.imageUrl || screenshots[bookmark.url]}
                      alt={bookmark.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{bookmark.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {bookmark.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {getHostname(bookmark.url)}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );

  // Mobile layout
  const MobileLayout = () => (
    <>
      {showMobileList ? (
        <div className="flex flex-col min-h-screen bg-white h-[100vh]">
          <div className="sticky top-0 bg-white border-b">
            <div className="px-4 py-3">
              <button
                onClick={() => setShowMobileList(false)}
                className="text-sm text-gray-500"
              >
                返回分类
              </button>
            </div>
            <div className="px-4 pb-3 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {Array.isArray(categories) &&
                  categories.find(
                    (cat) => cat._id?.toString() === selectedCategory
                  )?.name}
              </h2>
              {selectedCategory && (
                <Link
                  href={`/api/rss?categoryId=${selectedCategory}`}
                  target="_blank"
                  className="text-orange-500"
                  title="订阅当前分类"
                >
                  <RssIcon className="w-4 h-4" isSelected={true} />
                </Link>
              )}
            </div>
          </div>
          <div ref={mobileContentRef} className="p-4 space-y-4 overflow-y-auto">
            {Array.isArray(bookmarks) &&
              bookmarks.map((bookmark) => (
                <Link
                  href={bookmark.url}
                  key={bookmark._id?.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-100 p-4">
                    {(bookmark.imageUrl || screenshots[bookmark.url]) && (
                      <Image
                        src={bookmark.imageUrl || screenshots[bookmark.url]}
                        alt={bookmark.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{bookmark.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {bookmark.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      {getHostname(bookmark.url)}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">书签</h1>
            <Link
              href="/api/rss"
              target="_blank"
              className="text-orange-500"
              title="订阅全部书签"
            >
              <RssIcon className="w-5 h-5" isSelected={true} />
            </Link>
          </div>
          <div className="space-y-2">
            {Array.isArray(categories) &&
              categories.map((category) => (
                <button
                  key={category._id?.toString()}
                  onClick={() => {
                    setSelectedCategory(category._id?.toString() || null);
                    setShowMobileList(true);
                  }}
                  className="w-full p-3 rounded-lg border border-gray-200 text-left"
                >
                  <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {categoryBookmarkCounts[category._id?.toString() || ""] ||
                        0}{" "}
                      个站点
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex-1">
        <div className="lg:hidden">
          <BookmarksSkeleton isMobile={true} />
        </div>
        <div className="hidden lg:block">
          <BookmarksSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex-1">
      <div className="lg:hidden">
        <MobileLayout />
      </div>
      <div className="hidden lg:block">
        <WebLayout />
      </div>
    </div>
  );
}
