"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IBookmark, IBookmarkCategory } from "../model/bookmark";

interface Screenshot {
  url: string;
  screenshot?: string;
}

// Cache management functions
const CACHE_KEYS = {
  CATEGORIES: "bookmark_categories",
  BOOKMARKS: "bookmark_bookmarks_",
  SCREENSHOTS: "bookmark_screenshots",
  LAST_FETCH: "bookmark_last_fetch_",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

export default function Bookmarks() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<IBookmarkCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [showMobileList, setShowMobileList] = useState(false);

  // 提取获取分类的函数
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/bookmarkCategories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        setCache(CACHE_KEYS.CATEGORIES, data.categories);
        if (data.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(data.categories[0]._id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // 如果请求失败，尝试使用缓存
      const cached = getFromCache<IBookmarkCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cached) {
        setCategories(cached);
        if (cached.length > 0 && !selectedCategory) {
          setSelectedCategory(cached[0]._id!.toString());
        }
      }
    }
  };

  // 提取获取书签的函数
  const fetchBookmarks = async (categoryId: string) => {
    if (!categoryId) return;

    try {
      const response = await fetch(`/api/bookmarks?categoryId=${categoryId}`);
      const data = await response.json();
      if (data.success) {
        setBookmarks(data.bookmarks);
        setCache(CACHE_KEYS.BOOKMARKS + categoryId, data.bookmarks);
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      // 如果请求失败，尝试使用缓存
      const cached = getFromCache<IBookmark[]>(CACHE_KEYS.BOOKMARKS + categoryId);
      if (cached) {
        setBookmarks(cached);
      }
    }
  };

  // 初始加载和定时刷新分类
  useEffect(() => {
    fetchCategories();
    
    // 每30秒刷新一次分类
    const categoryInterval = setInterval(fetchCategories, 30000);
    
    return () => clearInterval(categoryInterval);
  }, []);

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
  }, [selectedCategory]);

  // Fetch screenshots with cache
  useEffect(() => {
    const fetchScreenshot = async (bookmark: IBookmark) => {
      if (screenshots[bookmark.url] || bookmark.imageUrl) return;

      // Try to get from cache first
      const cachedScreenshots =
        getFromCache<Record<string, string>>(CACHE_KEYS.SCREENSHOTS) || {};
      if (cachedScreenshots[bookmark.url]) {
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
  }, [bookmarks, screenshots]);

  // Web layout
  const WebLayout = () => (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 min-h-screen border-r border-gray-100 flex-shrink-0">
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <Link
            href="/rss"
            className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            RSS 订阅
          </Link>
        </div>

        {/* Categories */}
        <nav className="p-4">
          {categories.map((category) => (
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
                <span className="text-sm opacity-60">
                  {category.bookmarks.length} 个站点
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {
            categories.find((cat) => cat._id?.toString() === selectedCategory)
              ?.name
          }
        </h2>
        <div className="grid grid-cols-2 gap-6 w-full">
          {bookmarks.map((bookmark) => (
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
                  {new URL(bookmark.url).hostname}
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
    <div className="lg:hidden">
      {showMobileList ? (
        <div className="min-h-screen bg-white">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className="p-4 flex items-center">
              <button
                onClick={() => setShowMobileList(false)}
                className="flex items-center text-sm text-gray-600"
              >
                <span className="mr-2">←</span>
                返回分类
              </button>
            </div>
            <div className="px-4 pb-3">
              <h2 className="text-xl font-bold">
                {
                  categories.find(
                    (cat) => cat._id?.toString() === selectedCategory
                  )?.name
                }
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {bookmarks.map((bookmark) => (
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
                    {new URL(bookmark.url).hostname}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">导航站</h1>
            <div className="flex items-center space-x-4">
              <Link href="/rss" className="text-sm text-gray-600">
                RSS 订阅
              </Link>
              <button className="px-3 py-1 bg-black text-white text-sm rounded-md">
                提交
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
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
                    {category.bookmarks.length} 个站点
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:hidden">
        <MobileLayout />
      </div>
      <div className="hidden lg:block">
        <WebLayout />
      </div>
    </div>
  );
}
