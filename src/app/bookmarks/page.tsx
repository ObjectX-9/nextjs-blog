"use client";

import { useState, useEffect, useCallback } from "react";
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
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    // 添加基本的类型验证
    if (!parsed || typeof parsed !== 'object') return null;

    // 如果是日期字符串，转换为 Date 对象
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      })) as T;
    }

    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : undefined,
      updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : undefined,
    } as T;
  } catch (error) {
    console.error('Error reading from cache:', error);
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
  const fetchCategories = useCallback(async () => {
    try {
      const cachedCategories = getFromCache<IBookmarkCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories && Array.isArray(cachedCategories)) {
        setCategories(cachedCategories);
      }

      const response = await fetch("/api/bookmarks/categories");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
          setCache(CACHE_KEYS.CATEGORIES, data);
          
          // Set initial selected category if none is selected
          if (!selectedCategory && data.length > 0 && data[0]._id) {
            setSelectedCategory(data[0]._id.toString());
          }
        } else {
          console.error("Invalid categories data format:", data);
          setCategories([]);
        }
      } else {
        console.error("Failed to fetch categories:", response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, [selectedCategory]);

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
  }, [fetchCategories]);

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
      <aside className="w-64 border-r bg-white">
        <nav className="p-4">
          {Array.isArray(categories) && categories.map((category) => (
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
                  {category.bookmarks?.length || 0} 个站点
                </span>
              </div>
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {Array.isArray(categories) && categories.find((cat) => cat._id?.toString() === selectedCategory)?.name}
        </h2>
        <div className="grid grid-cols-2 gap-6 w-full">
          {Array.isArray(bookmarks) && bookmarks.map((bookmark) => (
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
    <>
      {showMobileList ? (
        <div className="min-h-screen bg-white">
          <div className="sticky top-0 bg-white border-b">
            <div className="px-4 py-3">
              <button
                onClick={() => setShowMobileList(false)}
                className="text-sm text-gray-500"
              >
                返回分类
              </button>
            </div>
            <div className="px-4 pb-3">
              <h2 className="text-xl font-bold">
                {Array.isArray(categories) && categories.find(
                  (cat) => cat._id?.toString() === selectedCategory
                )?.name}
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.isArray(bookmarks) && bookmarks.map((bookmark) => (
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
          <h1 className="text-2xl font-bold mb-6">书签</h1>
          <div className="space-y-2">
            {Array.isArray(categories) && categories.map((category) => (
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
                    {category.bookmarks?.length || 0} 个站点
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
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
