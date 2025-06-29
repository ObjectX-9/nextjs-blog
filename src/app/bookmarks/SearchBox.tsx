"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { IBookmark } from "../model/bookmark";
import { bookmarksBusiness } from "@/app/business/bookmarks";

interface SearchBoxProps {
    onSearchResults: (results: IBookmark[], isSearching: boolean, query: string) => void;
    placeholder?: string;
}

export function SearchBox({ onSearchResults, placeholder = "搜索书签..." }: SearchBoxProps) {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // 防抖搜索函数
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onSearchResults([], false, "");
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        try {
            const results = await bookmarksBusiness.searchBookmarks(searchQuery);
            onSearchResults(results, true, searchQuery);
        } catch (error) {
            console.error("Search error:", error);
            onSearchResults([], true, searchQuery);
        } finally {
            setIsSearching(false);
        }
    }, [onSearchResults]);

    // 处理输入变化
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // 清除之前的搜索计时器
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // 设置新的搜索计时器（防抖 300ms）
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    }, [performSearch]);

    // 清除搜索
    const clearSearch = useCallback(() => {
        setQuery("");
        onSearchResults([], false, "");

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [onSearchResults]);

    // 组件卸载时清理计时器
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                />

                {/* 搜索图标 */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-4 w-4 text-gray-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* 清除按钮 */}
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {/* 加载指示器 */}
                {isSearching && (
                    <div className="absolute inset-y-0 right-8 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
} 