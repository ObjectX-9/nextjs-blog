"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IBookmark, IBookmarkCategory } from "../model/bookmark";
import { RssIcon } from "@/components/icons/RssIcon";
import { getHostname } from "@/utils/url";

interface WebBookmarksViewProps {
    categories: IBookmarkCategory[];
    selectedCategory: string | null;
    setSelectedCategory: (categoryId: string | null) => void;
    bookmarks: IBookmark[];
    categoryBookmarkCounts: Record<string, number>;
    searchBox: React.ReactNode;
    displayTitle: string | null;
    isSearchMode: boolean;
    showSearchBox: boolean;
    toggleSearchBox: () => void;
}

export function WebBookmarksView({
    categories,
    selectedCategory,
    setSelectedCategory,
    bookmarks,
    categoryBookmarkCounts,
    searchBox,
    displayTitle,
    isSearchMode,
    showSearchBox,
    toggleSearchBox,
}: WebBookmarksViewProps) {
    const mainContentRef = useRef<HTMLDivElement>(null);

    // 使用 DOM 直接操作，完全避免 React 重新渲染
    const screenshotsCache = useRef<Record<string, string>>({});
    const observerRef = useRef<IntersectionObserver | null>(null);
    const processingUrls = useRef<Set<string>>(new Set());

    // 直接操作 DOM 显示截图，避免 React 重新渲染
    const updateImageInDOM = useCallback((url: string, screenshotUrl: string) => {
        const elements = document.querySelectorAll(`[data-url="${url}"]`);
        elements.forEach((element) => {
            const placeholderDiv = element.querySelector('.placeholder-content');
            if (placeholderDiv) {
                // 创建图片元素
                const img = document.createElement('img');
                img.src = screenshotUrl;
                img.alt = 'Screenshot';
                img.className = 'w-full h-full object-contain rounded-lg';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';

                // 替换占位符
                placeholderDiv.replaceWith(img);
            }
        });
    }, []);

    // 获取单个截图的函数
    const fetchScreenshotForUrl = useCallback(async (url: string) => {
        if (processingUrls.current.has(url) || screenshotsCache.current[url]) {
            return;
        }

        processingUrls.current.add(url);

        try {
            const response = await fetch(
                `/api/screenshot?url=${encodeURIComponent(url)}`
            );
            const data = await response.json();

            if (data.screenshot) {
                screenshotsCache.current[url] = data.screenshot;
                // 直接更新 DOM，不触发 React 重新渲染
                updateImageInDOM(url, data.screenshot);
            }
        } catch (error) {
            console.error("Failed to fetch screenshot:", error);
        } finally {
            processingUrls.current.delete(url);
        }
    }, [updateImageInDOM]);

    // 初始化交集观察器
    useEffect(() => {
        if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const url = entry.target.getAttribute('data-url');
                            const hasImage = entry.target.getAttribute('data-has-image') === 'true';

                            if (url && !hasImage) {
                                fetchScreenshotForUrl(url);
                                // 停止观察已经开始加载的元素
                                observerRef.current?.unobserve(entry.target);
                            }
                        }
                    });
                },
                {
                    rootMargin: '100px', // 提前100px开始加载
                    threshold: 0.1
                }
            );
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [fetchScreenshotForUrl]);

    // 清理缓存当书签改变时
    useEffect(() => {
        screenshotsCache.current = {};
        processingUrls.current.clear();

        // 切换分类时滚动到顶部
        setTimeout(() => {
            if (mainContentRef.current) {
                mainContentRef.current.scrollTop = 0;
            }
        }, 0);
    }, [bookmarks]);

    return (
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
                                className={`w-full text-left p-2 rounded-lg mb-2 ${selectedCategory === category._id?.toString()
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
                className="flex-1 p-8 overflow-y-auto custom-scrollbar-thin"
                style={{ height: 'calc(100vh - 0px)' }}
            >
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {displayTitle || (Array.isArray(categories) &&
                                categories.find((cat) => cat._id?.toString() === selectedCategory)
                                    ?.name)}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {/* 搜索图标 */}
                            <button
                                onClick={toggleSearchBox}
                                className={`group relative p-2 rounded-full transition-all duration-200 ${showSearchBox
                                    ? 'bg-gray-100 text-gray-700 shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm'
                                    } active:scale-95`}
                                title={showSearchBox ? "隐藏搜索框" : "显示搜索框"}
                            >
                                <svg
                                    className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                {/* 激活时的小点指示器 */}
                                {showSearchBox && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-600 rounded-full animate-pulse" />
                                )}
                            </button>

                            {/* RSS订阅图标 */}
                            {selectedCategory && !isSearchMode && (
                                <Link
                                    href={`/api/rss?categoryId=${selectedCategory}`}
                                    target="_blank"
                                    className="text-orange-500 hover:text-orange-600 flex items-center"
                                    title="订阅当前分类"
                                >
                                    <RssIcon className="w-5 h-5" isSelected={false} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 搜索框 */}
                    {showSearchBox && (
                        <div className="flex justify-center">
                            {searchBox}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-6 w-full">
                    {Array.isArray(bookmarks) &&
                        bookmarks.map((bookmark) => (
                            <Link
                                href={bookmark.url}
                                key={bookmark._id?.toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow w-full"
                            >
                                <div
                                    ref={(element) => {
                                        if (element && observerRef.current) {
                                            observerRef.current.observe(element);
                                        }
                                    }}
                                    className="aspect-video bg-gray-100 p-4 relative"
                                    data-url={bookmark.url}
                                    data-has-image={!!bookmark.imageUrl}
                                >
                                    {bookmark.imageUrl ? (
                                        <Image
                                            src={bookmark.imageUrl}
                                            alt={bookmark.title}
                                            width={400}
                                            height={225}
                                            className="w-full h-full object-contain rounded-lg"
                                            priority={false}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div className="placeholder-content w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            {bookmark.title}
                                        </div>
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
} 