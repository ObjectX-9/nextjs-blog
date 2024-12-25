"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Article, ArticleCategory } from "../model/article";
import { Table } from "@/components/Table";

// 缓存管理
const CACHE_KEYS = {
  CATEGORIES: "docs_categories",
  ARTICLES: "docs_articles_",
  LAST_FETCH: "docs_last_fetch_",
};

function getFromCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    if (!parsed || typeof parsed !== 'object') return null;

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

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showMobileList, setShowMobileList] = useState(false);
  const [categoryArticleCounts, setCategoryArticleCounts] = useState<Record<string, number>>({});

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const cachedCategories = getFromCache<ArticleCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories && Array.isArray(cachedCategories)) {
        console.log('Using cached categories:', cachedCategories);
        setCategories(cachedCategories);
        if (!selectedCategory && cachedCategories.length > 0 && cachedCategories[0]._id) {
          setSelectedCategory(cachedCategories[0]._id.toString());
        }
      }

      // 获取所有文章以计算每个分类的文章数量
      const articlesResponse = await fetch("/api/articles");
      const articlesData = await articlesResponse.json();
      const articleCounts: Record<string, number> = {};

      if (articlesData.success && Array.isArray(articlesData.articles)) {
        console.log('Articles data:', articlesData.articles);
        articlesData.articles.forEach((article: Article) => {
          const categoryId = typeof article.categoryId === 'string'
            ? article.categoryId
            : article.categoryId.toString();
          articleCounts[categoryId] = (articleCounts[categoryId] || 0) + 1;
        });
        console.log('Article counts:', articleCounts);
      }

      const response = await fetch("/api/articles/categories");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          console.log('Categories data:', data.categories);
          const processedCategories = data.categories.map((category: ArticleCategory) => {
            const categoryId = typeof category._id === 'string'
              ? category._id
              : category._id?.toString() || '';
            return {
              ...category,
              articleCount: articleCounts[categoryId] || 0,
            };
          });
          setCategories(processedCategories);
          setCategoryArticleCounts(articleCounts);
          setCache(CACHE_KEYS.CATEGORIES, processedCategories);

          if (!selectedCategory && processedCategories.length > 0) {
            setSelectedCategory(processedCategories[0]._id?.toString() || null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [selectedCategory]);

  // 获取文章列表
  const fetchArticles = useCallback(async (categoryId: string) => {
    try {
      console.log('Fetching articles for category:', categoryId);
      const cachedArticles = getFromCache<Article[]>(`${CACHE_KEYS.ARTICLES}${categoryId}`);
      if (cachedArticles) {
        console.log('Using cached articles:', cachedArticles);
        setArticles(cachedArticles);
      }

      const response = await fetch(`/api/articles?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.articles)) {
          console.log('Articles data:', data.articles);
          const articlesData = data.articles || [];
          setArticles(articlesData);
          setCache(`${CACHE_KEYS.ARTICLES}${categoryId}`, articlesData);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]); // 设置为空数组以防止错误
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchArticles(selectedCategory);
    }
  }, [selectedCategory, fetchArticles]);

  return (
    <div className="flex h-screen w-full box-border">
      {/* 移动端切换按钮 */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg"
        onClick={() => setShowMobileList(!showMobileList)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={showMobileList ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* 左侧分类列表 */}
      <aside className={`${
        showMobileList ? "fixed inset-0 z-40 bg-white" : "hidden"
      } md:block md:w-64 md:sticky md:top-0 md:h-screen border-r bg-white overflow-y-auto`}>
        <nav className="p-4">
          {Array.isArray(categories) && categories.map((category) => (
            <button
              key={category._id?.toString()}
              onClick={() => {
                setSelectedCategory(category._id?.toString() || null);
                setShowMobileList(false);
              }}
              className={`w-full text-left p-2 rounded-lg mb-2 ${
                selectedCategory === category._id?.toString()
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="text-sm opacity-60">
                  {categoryArticleCounts[category._id?.toString() || ""] || 0} 篇文章
                </span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* 右侧文章列表 */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="py-8 px-8">
          <h1 className="text-3xl font-bold mb-6">文章</h1>
          <div className="mb-6 last:mb-0">收集的一些有趣的文章</div>
          <div className="border border-gray-200 rounded-xl">
            {Array.isArray(articles) && articles.length > 0 ? (
              <Table
                items={articles.map((article) => {
                  const date = new Date(article.createdAt);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  
                  return {
                    id: article._id?.toString() || '',
                    year,
                    date: `${day}/${month}`,
                    title: article.title,
                    tags: article.tags,
                    views: article.views,
                    likes: article.likes,
                    url: article.url,
                  };
                })}
                fields={[
                  {
                    key: 'year',
                    label: 'Year',
                    align: 'left',
                    className: 'w-[10%] whitespace-nowrap',
                  },
                  {
                    key: 'date',
                    label: 'Date',
                    align: 'left',
                    className: 'w-[10%] whitespace-nowrap',
                  },
                  {
                    key: 'title',
                    label: 'Title',
                    align: 'left',
                    className: 'w-[35%]',
                    render: (value, item) => (
                      <Link
                        href={item.url}
                        target="_blank"
                        className="text-gray-900 hover:text-blue-600 transition-colors block truncate"
                        title={value}
                      >
                        {value}
                      </Link>
                    ),
                  },
                  {
                    key: 'tags',
                    label: 'Tags',
                    align: 'left',
                    className: 'w-[25%]',
                    render: (tags: string[]) => (
                      <div className="flex flex-wrap gap-1 max-w-full">
                        {tags && tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded truncate max-w-[100px]"
                            title={tag}
                          >
                            {tag}
                          </span>
                        ))}
                        {tags && tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'views',
                    label: 'Views',
                    align: 'right',
                    className: 'w-[10%] whitespace-nowrap',
                    render: (value) => value.toLocaleString(),
                  },
                  {
                    key: 'likes',
                    label: 'Likes',
                    align: 'right',
                    className: 'w-[10%] whitespace-nowrap',
                    render: (value) => value.toLocaleString(),
                  },
                ]}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                暂无文章
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
