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
      return data.map((item: any) => ({
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
  const [categoryArticleCounts, setCategoryArticleCounts] = useState<Record<string, number>>({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [showArticleList, setShowArticleList] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 1024; 
      setIsMobileView(isMobile);
      if (isMobile) {
        setShowArticleList(false);
      }
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // 获取文章列表
  const fetchArticles = useCallback(async (categoryId: string) => {
    try {
      console.log('Fetching articles for category:', categoryId);
      const cachedArticles = getFromCache<Article[]>(`${CACHE_KEYS.ARTICLES}${categoryId}`);
      if (cachedArticles) {
        console.log('Using cached articles:', cachedArticles);
        // 过滤出属于当前分类的文章
        const filteredArticles = cachedArticles.filter((article: Article) => 
          article.categoryId && article.categoryId.toString() === categoryId
        );
        setArticles(filteredArticles);
        return;
      }

      const response = await fetch(`/api/articles?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.articles)) {
          console.log('Articles data:', data.articles);
          // 过滤出属于当前分类的文章
          const filteredArticles = data.articles.filter((article: Article) => 
            article.categoryId && article.categoryId.toString() === categoryId
          );
          setArticles(filteredArticles);
          setCache(`${CACHE_KEYS.ARTICLES}${categoryId}`, filteredArticles);
        } else {
          setArticles([]);
        }
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
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
        // 确保每篇文章只被计入一次
        const uniqueArticles = articlesData.articles.reduce((acc: Article[], article: Article) => {
          const existingArticle = acc.find(a => a._id === article._id);
          if (!existingArticle && article.categoryId) {
            acc.push(article);
          }
          return acc;
        }, []);

        // 计算每个分类的文章数量
        uniqueArticles.forEach((article: Article) => {
          if (article.categoryId) {
            const categoryId = article.categoryId.toString();
            articleCounts[categoryId] = (articleCounts[categoryId] || 0) + 1;
          }
        });
      }

      const response = await fetch("/api/articles/categories");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          console.log('Categories data:', data.categories);
          // 只保留有文章的分类
          const processedCategories = data.categories
            .filter((category: ArticleCategory) => {
              const categoryId = category._id?.toString() || '';
              return articleCounts[categoryId] > 0;
            });

          setCategories(processedCategories);
          setCategoryArticleCounts(articleCounts);
          setCache(CACHE_KEYS.CATEGORIES, processedCategories);

          // 如果没有选中的分类，选择第一个有文章的分类
          if (!selectedCategory && processedCategories.length > 0) {
            const firstCategory = processedCategories[0];
            setSelectedCategory(firstCategory._id?.toString() || null);
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

  // 当选择分类时的处理
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (isMobileView) {
      setShowArticleList(true);
    }
  };

  // 返回分类列表
  const handleBackToCategories = () => {
    if (isMobileView) {
      setShowArticleList(false);
    }
  };

  const renderArticleList = () => {
    return (
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
              const response = await fetch(`/api/articles/${item.id}/view`, {
                method: 'POST',
              });

              if (response.ok) {
                const newViews = parseInt(item.views as string) + 1;

                // 更新本地状态
                setArticles(prev => prev.map(article =>
                  article._id?.toString() === item.id
                    ? { ...article, views: newViews }
                    : article
                ));

                // 更新所有缓存中的文章浏览量
                const cacheKeys = Object.keys(localStorage);
                cacheKeys.forEach(key => {
                  if (key.startsWith('docs_articles_')) {
                    try {
                      const cachedData = localStorage.getItem(key);
                      if (cachedData) {
                        const parsed = JSON.parse(cachedData);
                        if (parsed.data && Array.isArray(parsed.data)) {
                          const updatedArticles = parsed.data.map((article: Article) => {
                            if (article._id?.toString() === item.id) {
                              return {
                                ...article,
                                views: newViews
                              };
                            }
                            return article;
                          });

                          localStorage.setItem(
                            key,
                            JSON.stringify({
                              data: updatedArticles,
                              timestamp: Date.now(),
                            })
                          );
                        }
                      }
                    } catch (error) {
                      console.error('Error updating cache:', error);
                    }
                  }
                });
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
    );
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row">
      {/* 移动端布局 */}
      <div className="lg:hidden w-full">
        {/* 移动端分类列表 */}
        {!showArticleList && (
          <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-6">文章分类</h1>
            <div className="space-y-2 w-full">
              {Array.isArray(categories) && categories.map((category) => (
                <button
                  key={category._id?.toString()}
                  onClick={() => handleCategorySelect(category._id?.toString() || '')}
                  className="w-full p-3 rounded-lg border border-gray-200 text-left"
                >
                  <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {categoryArticleCounts[category._id?.toString() || ""] || 0} 篇文章
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 移动端文章列表 */}
        {showArticleList && (
          <div className="flex flex-col w-full min-h-screen bg-white">
            <div className="sticky top-0 bg-white border-b">
              <div className="px-4 py-3">
                <button
                  onClick={handleBackToCategories}
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
            <div className="p-4">
              <div className="mb-6 last:mb-0">写过的一些技术文章</div>
              <div className="border border-gray-200 rounded-xl">
                {renderArticleList()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Web布局 */}
      <div className="hidden lg:block w-64 border-r bg-white">
        {/* 分类侧边栏 */}
        <div className="sticky top-0 h-screen overflow-y-auto">
          <nav className="p-4">
            {Array.isArray(categories) && categories.map((category) => (
              <button
                key={category._id?.toString()}
                onClick={() => handleCategorySelect(category._id?.toString() || '')}
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
        </div>
      </div>

      {/* 文章列表 */}
      <div className="hidden lg:block flex-1">
        <div className="h-screen overflow-y-auto">
          <div className="py-8 px-8">
            <h1 className="text-3xl font-bold mb-6">文章</h1>
            <div className="mb-6 last:mb-0">写过的一些技术文章</div>
            <div className="border border-gray-200 rounded-xl">
              {renderArticleList()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
