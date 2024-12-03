"use client";

import { useState, useEffect } from "react";
import { bookmarkData } from "../../config/bookmarks";
import Image from "next/image";
import Link from "next/link";

interface Screenshot {
  url: string;
  screenshot?: string;
}

export default function Bookmarks() {
  const [selectedCategory, setSelectedCategory] = useState("软件 & 工具");
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    const currentBookmarks =
      bookmarkData.find((cat) => cat.name === selectedCategory)?.bookmarks ||
      [];

    currentBookmarks.forEach(async (bookmark) => {
      if (screenshots[bookmark.url] || bookmark.imageUrl) return;

      try {
        const response = await fetch(
          `/api/screenshot?url=${encodeURIComponent(bookmark.url)}`
        );
        const data = await response.json();

        if (data.screenshot) {
          setScreenshots((prev) => ({
            ...prev,
            [bookmark.url]: data.screenshot,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    });
  }, [selectedCategory, screenshots]);

  // 移动端分类列表
  const MobileCategoryList = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">导航站</h1>
        <div className="flex items-center space-x-4">
          <Link href="/rss" className="text-gray-600 hover:text-gray-900">
            RSS 订阅
          </Link>
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            提交
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {bookmarkData.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              setSelectedCategory(category.name);
              setShowMobileList(true);
            }}
            className="w-full text-left p-4 rounded-xl border border-gray-200 active:bg-gray-50"
          >
            <div className="font-medium text-base">{category.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {category.bookmarks.length} 个站点
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 移动端书签列表
  const MobileBookmarkList = () => (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => setShowMobileList(false)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span className="text-gray-400">←</span>
            返回分类
          </button>
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-xl font-bold">{selectedCategory}</h2>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {bookmarkData
          .find((cat) => cat.name === selectedCategory)
          ?.bookmarks.map((bookmark, index) => (
            <Link
              href={bookmark.url}
              key={index}
              className="block p-4 border border-gray-200 rounded-xl hover:border-gray-300"
            >
              {(bookmark.imageUrl || screenshots[bookmark.url]) && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={bookmark.imageUrl || screenshots[bookmark.url]}
                    alt={bookmark.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{bookmark.title}</h3>
              <div className="text-gray-600 text-sm mb-2">
                {new URL(bookmark.url).hostname}
              </div>
              <p className="text-gray-700 text-sm">{bookmark.description}</p>
            </Link>
          ))}
      </div>
    </div>
  );

  // Web layout
  const WebLayout = () => (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 p-8 border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">导航站</h1>
          <div className="flex items-center space-x-4">
            <Link href="/rss" className="text-gray-600 hover:text-gray-900">
              RSS 订阅
            </Link>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
              提交
            </button>
          </div>
        </div>

        {/* Categories */}
        <nav>
          {bookmarkData.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full text-left py-3 px-4 rounded-lg mb-2 ${
                selectedCategory === category.name
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-sm opacity-70">{category.bookmarks.length} 个站点</div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-4xl font-bold mb-8">{selectedCategory}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarkData
            .find((cat) => cat.name === selectedCategory)
            ?.bookmarks.map((bookmark, index) => (
              <Link
                href={bookmark.url}
                key={index}
                className="block p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {(bookmark.imageUrl || screenshots[bookmark.url]) && (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={bookmark.imageUrl || screenshots[bookmark.url]}
                      alt={bookmark.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{bookmark.title}</h3>
                <div className="text-gray-600 text-sm mb-2">
                  {new URL(bookmark.url).hostname}
                </div>
                <p className="text-gray-700">{bookmark.description}</p>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile View */}
      <div className="lg:hidden">
        {showMobileList ? <MobileBookmarkList /> : <MobileCategoryList />}
      </div>

      {/* Web View */}
      <div className="hidden lg:block">
        <WebLayout />
      </div>
    </div>
  );
}
