'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleCategory } from '@/app/model/article';


export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'articles'>('categories');

  // 检测移动端视图
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (isMobile) {
        setCurrentView('categories');
      }
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      // 从 URL 参数获取分类
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get('category');
      if (categoryFromUrl) {
        setSelectedCategory(categoryFromUrl);
      } else {
        // 如果 URL 没有分类参数，从 localStorage 获取
        const lastCategory = localStorage.getItem('lastCategory');
        if (lastCategory) {
          setSelectedCategory(lastCategory);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchArticles(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      if (!response.ok) {
        throw new Error('获取分类列表失败');
      }
      const data = await response.json();
      setCategories(data.categories);
      if (data.categories.length > 0) {
        setSelectedCategory(data.categories[0]._id);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  const fetchArticles = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles?categoryId=${categoryId}`);
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // 保存选中的分类
    localStorage.setItem('lastCategory', categoryId);
    if (isMobileView) {
      setCurrentView('articles');
    }
  };

  const handleArticleClick = (article: Article) => {
    if (isMobileView) {
      // 移动端使用 window.location.href 进行跳转，以支持浏览器返回
      window.location.href = `/articles/${article._id}`;
    } else {
      router.push(`/articles/${article._id}`);
    }
  };

  const handleBack = () => {
    if (currentView === 'articles') {
      setCurrentView('categories');
    }
  };

  if (loading && !categories.length) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex relative">
      {isMobileView ? (
        <div className="w-full">
          {/* 分类视图 */}
          <div
            className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">技术文档分类</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 pt-0">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id!)}
                      className="w-full text-left p-3 border-b last:border-b-0"
                    >
                      <span className="truncate block">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 文章列表视图 */}
          <div
            className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'articles' ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            <button
              onClick={handleBack}
              className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="p-4 pt-16">
              <h2 className="text-lg font-bold mb-4">
                {categories.find(c => c._id === selectedCategory)?.name || '所有文章'}
              </h2>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <button
                    key={article._id}
                    onClick={() => handleArticleClick(article)}
                    className="w-full text-left p-3 border-b last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <div className="font-medium truncate">{article.title}</div>
                      <span className="text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 py-8">
                  暂无文章
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full">
          {/* 分类列表 */}
          <div className="w-64 border-r bg-white">
            <div className="sticky top-0 h-screen overflow-y-auto">
              <nav className="p-4">
                <h2 className="text-lg font-bold mb-4">技术文档</h2>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category._id!)}
                    className={`w-full text-left p-2 rounded-lg mb-2 ${selectedCategory === category._id
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 文章列表 */}
          <div className="w-64 border-r bg-white">
            <div className="sticky top-0 h-screen overflow-y-auto">
              <nav className="p-4">
                <h2 className="text-lg font-bold mb-4">
                  {categories.find(c => c._id === selectedCategory)?.name || '所有文章'}
                </h2>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : articles.length > 0 ? (
                  articles.map((article) => (
                    <button
                      key={article._id}
                      onClick={() => handleArticleClick(article)}
                      className="w-full text-left p-2 rounded-lg mb-2 hover:bg-gray-100"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{article.title}</span>
                        <span className="text-sm opacity-60">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    暂无文章
                  </div>
                )}
              </nav>
            </div>
          </div>

          {/* 右侧空白区域 */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-gray-500">
              请选择一篇文章
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
