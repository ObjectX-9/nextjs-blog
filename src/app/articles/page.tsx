"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Article, ArticleCategory } from "../model/article";
import { Table } from "@/components/Table";
import LikeButton from "@/components/LikeButton";
import ViewCounter from "@/components/ViewCounter";

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
    if (!parsed || !parsed.data) return null;

    const data = parsed.data;
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      })) as T;
    }

    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
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

interface ArticleTableItem extends Record<string, string | number> {
  id: string;
  year: string;
  date: string;
  title: string;
  tags: string;
  views: string;
  likes: string;
  url: string;
}

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showMobileList, setShowMobileList] = useState(false);
  const [categoryArticleCounts, setCategoryArticleCounts] = useState<Record<string, number>>({});

  // 获取文章列表
  const fetchArticles = useCallback(async (categoryId: string) => {
    try {
      console.log('Fetching articles for category:', categoryId);
      const cachedArticles = getFromCache<Article[]>(`${CACHE_KEYS.ARTICLES}${categoryId}`);
      if (cachedArticles) {
        console.log('Using cached articles:', cachedArticles);
        setArticles(cachedArticles);
        return;
      }

      const response = await fetch(`/api/articles?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.articles)) {
          console.log('Articles data:', data.articles);
          const articlesData = data.articles || [];
          setArticles(articlesData);
          setCache(`${CACHE_KEYS.ARTICLES}${categoryId}`, articlesData);
        } else {
          setArticles([]);
        }
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]); // 设置为空数组以防止错误
    }
  }, []);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const cachedCategories = getFromCache<ArticleCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories && Array.isArray(cachedCategories)) {
        console.log('Using cached categories:', cachedCategories);
        setCategories(cachedCategories);
      }

      // 获取所有文章以计算每个分类的文章数量
      const articlesResponse = await fetch("/api/articles");
      const articlesData = await articlesResponse.json();
      const articleCounts: Record<string, number> = {};

      if (articlesData.success && Array.isArray(articlesData.articles)) {
        console.log('Articles data:', articlesData.articles);
        articlesData.articles.forEach((article: Article) => {
          const categoryId = article.categoryId;
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
            const categoryId = category._id?.toString() || '';
            return {
              ...category,
              articleCount: articleCounts[categoryId] || 0,
            };
          });
          setCategories(processedCategories);
          setCategoryArticleCounts(articleCounts);
          setCache(CACHE_KEYS.CATEGORIES, processedCategories);

          // 只有当有文章的分类存在时，才设置选中的分类
          const categoryWithArticles = processedCategories.find(
            (category: ArticleCategory) => {
              const categoryId = category._id?.toString() || '';
              return articleCounts[categoryId] > 0;
            }
          );
          
          if (!selectedCategory && categoryWithArticles) {
            setSelectedCategory(categoryWithArticles._id?.toString() || null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      // 检查选中的分类是否有文章
      const categoryId = selectedCategory;
      const hasArticles = categoryArticleCounts[categoryId] > 0;
      
      if (hasArticles) {
        setArticles([]); // 清空当前文章列表
        fetchArticles(selectedCategory);
      } else {
        setArticles([]); // 如果分类没有文章，直接设置为空数组
      }
    } else {
      setArticles([]); // 如果没有选中分类，设置为空数组
    }
  }, [selectedCategory, fetchArticles, categoryArticleCounts]);

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
      <aside className={`${showMobileList ? "fixed inset-0 z-40 bg-white" : "hidden"
        } md:block md:w-64 md:sticky md:top-0 md:h-screen border-r bg-white overflow-y-auto`}>
        <nav className="p-4">
          {Array.isArray(categories) && categories.map((category) => (
            <button
              key={category._id?.toString()}
              onClick={() => {
                setSelectedCategory(category._id?.toString() || null);
                setShowMobileList(false);
              }}
              className={`w-full text-left p-2 rounded-lg mb-2 ${selectedCategory === category._id?.toString()
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
          <div className="mb-6 last:mb-0">写过的一些技术文章</div>
          <div className="border border-gray-200 rounded-xl">
            {Array.isArray(articles) && articles.length > 0 ? (
              <Table
                items={articles.map((article) => {
                  const date = new Date(article.createdAt);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1);
                  const day = String(date.getDate());

                  const item: ArticleTableItem = {
                    id: article._id?.toString() || '',
                    year: year.toString(),
                    date: `${month}/${day}`,
                    title: article.title,
                    tags: JSON.stringify(article.tags || []),
                    views: article.views.toString(),
                    likes: article.likes.toString(),
                    url: article.url,
                  };
                  return item;
                })}
                onRowClick={async (item) => {
                  if (item.url) {
                    // 增加浏览量
                    try {
                      await fetch(`/api/articles/${item.id}/view`, {
                        method: 'POST',
                      });

                      // 更新本地状态
                      setArticles(prev => prev.map(article =>
                        article._id?.toString() === item.id
                          ? { ...article, views: article.views + 1 }
                          : article
                      ));

                      // 更新缓存
                      const cachedArticles = getFromCache<Article[]>(`${CACHE_KEYS.ARTICLES}${selectedCategory}`);
                      if (cachedArticles) {
                        const updatedCache = cachedArticles.map(article =>
                          article._id?.toString() === item.id
                            ? { ...article, views: article.views + 1 }
                            : article
                        );
                        setCache(`${CACHE_KEYS.ARTICLES}${selectedCategory}`, updatedCache);
                      }
                    } catch (error) {
                      console.error('Error incrementing view:', error);
                    }

                    // 打开文章链接
                    window.open(item.url as string, '_blank');
                  }
                }}
                fields={[
                  {
                    key: 'year',
                    label: '年',
                    align: 'left',
                    className: 'w-[10%] whitespace-nowrap',
                  },
                  {
                    key: 'date',
                    label: '日期',
                    align: 'left',
                    className: 'w-[10%] whitespace-nowrap',
                  },
                  {
                    key: 'title',
                    label: '标题',
                    align: 'left',
                    className: 'w-[35%]',
                    render: (value: any, item: { [key: string]: string | number }) => (
                      <Link
                        href={item.url as string}
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
                    label: '标签',
                    align: 'left',
                    className: 'w-[25%]',
                    render: (value: any, item: { [key: string]: string | number }) => {
                      const tags: string[] = JSON.parse(value as string);
                      return (
                        <div className="flex flex-wrap gap-1 max-w-full">
                          {tags?.slice(0, 3).map((tag) => (
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
                      );
                    },
                  },
                  {
                    key: 'views',
                    label: '浏览',
                    align: 'right',
                    className: 'w-[10%] whitespace-nowrap',
                    render: (value: any, item: { [key: string]: string | number }) => (
                      <ViewCounter
                        articleId={item.id as string}
                        initialViews={parseInt(value as string)}
                      />
                    ),
                  },
                  {
                    key: 'likes',
                    label: '点赞',
                    align: 'right',
                    className: 'w-[10%] whitespace-nowrap',
                    render: (value: any, item: { [key: string]: string | number }) => (
                      <LikeButton
                        articleId={item.id as string}
                        initialLikes={parseInt(value as string)}
                      />
                    ),
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
