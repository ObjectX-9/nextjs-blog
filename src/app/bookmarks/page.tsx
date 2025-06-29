"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IBookmark, IBookmarkCategory } from "../model/bookmark";
import { bookmarksBusiness } from "@/app/business/bookmarks";
import { BookmarksSkeleton } from "@/components/bookmarks/BookmarksSkeleton";
import { WebBookmarksView } from "./WebBookmarksView";
import { MobileBookmarksView } from "./MobileBookmarksView";
import { SearchBox } from "./SearchBox";

export default function Bookmarks() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<IBookmarkCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const [categoryBookmarkCounts, setCategoryBookmarkCounts] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // 搜索相关状态
  const [searchResults, setSearchResults] = useState<IBookmark[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);

  // 跟踪是否已经设置了初始分类
  const hasSetInitialCategory = useRef(false);

  // 处理搜索结果
  const handleSearchResults = useCallback((results: IBookmark[], isSearching: boolean, query: string) => {
    setSearchResults(results);
    setIsSearchMode(isSearching);
    setSearchQuery(query);
  }, []);

  // 切换搜索框显示状态
  const toggleSearchBox = useCallback(() => {
    setShowSearchBox(prev => !prev);
  }, []);

  // 获取分类和统计数据
  const fetchCategories = useCallback(async () => {
    try {
      // 使用统计API获取分类和书签数量
      const [categoriesData, categoryStats] = await Promise.all([
        bookmarksBusiness.getBookmarkCategories(),
        bookmarksBusiness.getBookmarkCategoryStats()
      ]);

      if (Array.isArray(categoriesData)) {
        const processedCategories = categoriesData.map(
          (category: IBookmarkCategory) => {
            const categoryId = category._id || '';
            return {
              ...category,
              _id: categoryId,
            };
          }
        );

        // 从统计数据中构建书签数量映射
        const bookmarkCounts: Record<string, number> = {};
        if (Array.isArray(categoryStats)) {
          categoryStats.forEach((stat) => {
            bookmarkCounts[stat.categoryId] = stat.count;
          });
        }

        setCategories(processedCategories);
        setCategoryBookmarkCounts(bookmarkCounts);

        // 只在首次加载时设置默认分类
        if (
          !hasSetInitialCategory.current &&
          processedCategories.length > 0 &&
          processedCategories[0]._id
        ) {
          setSelectedCategory(processedCategories[0]._id);
          hasSetInitialCategory.current = true;
        }
      } else {
        setCategories([]);
      }
      setIsLoading(false);
    } catch (error) {
      setCategories([]);
      setIsLoading(false);
    }
  }, []);

  // 获取书签数据
  const fetchBookmarks = useCallback(
    async (categoryId: string) => {
      if (!categoryId) return;

      try {
        const bookmarksData = await bookmarksBusiness.getBookmarks({ categoryId });
        if (Array.isArray(bookmarksData)) {
          setBookmarks(bookmarksData);
        } else {
          console.error("Invalid bookmarks data format:", bookmarksData);
          setBookmarks([]);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setBookmarks([]);
      }
    },
    []
  );

  // 初始加载
  useEffect(() => {
    setIsLoading(true);
    fetchCategories();
  }, [fetchCategories]);

  // 当选中的分类改变时获取书签
  useEffect(() => {
    if (selectedCategory && !isSearchMode) {
      fetchBookmarks(selectedCategory);
    }
  }, [selectedCategory, fetchBookmarks, isSearchMode]);

  // 确定要显示的书签和标题
  const displayBookmarks = isSearchMode ? searchResults : bookmarks;
  const displayTitle = isSearchMode
    ? `搜索结果: "${searchQuery}" (${searchResults.length}个)`
    : null;

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
        <MobileBookmarksView
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          bookmarks={displayBookmarks}
          categoryBookmarkCounts={categoryBookmarkCounts}
          searchBox={<SearchBox onSearchResults={handleSearchResults} />}
          displayTitle={displayTitle}
          isSearchMode={isSearchMode}
          showSearchBox={showSearchBox}
          toggleSearchBox={toggleSearchBox}
        />
      </div>
      <div className="hidden lg:block">
        <WebBookmarksView
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          bookmarks={displayBookmarks}
          categoryBookmarkCounts={categoryBookmarkCounts}
          searchBox={<SearchBox onSearchResults={handleSearchResults} />}
          displayTitle={displayTitle}
          isSearchMode={isSearchMode}
          showSearchBox={showSearchBox}
          toggleSearchBox={toggleSearchBox}
        />
      </div>
    </div>
  );
}
