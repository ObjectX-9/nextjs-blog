'use client';

import { useState, useEffect } from 'react';
import { Article, ArticleCategory } from '@/app/model/article';
import { MarkdownRenderer } from '@/components/customMdRender/core/MarkdownRenderer';
import '@/styles/markdown.css';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // 检测移动端视图
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setShowSidebar(!isMobile);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    fetchCategories();
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
      setSelectedArticle(null);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article: Article) => {
    try {
      setSelectedArticle(article);
      if (isMobileView) {
        setShowSidebar(false);
      }
      // 增加浏览量
      await fetch(`/api/articles/${article._id}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (loading && !categories.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex relative">
      {/* 移动端菜单按钮 */}
      {isMobileView && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {showSidebar ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {/* 侧边栏 */}
      <div
        className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 fixed lg:relative lg:translate-x-0 z-40 flex h-screen bg-white`}
      >
        {/* 分类列表 */}
        <div className="w-64 border-r bg-white">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <nav className="p-4">
              <h2 className="text-lg font-bold mb-4">技术文档</h2>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setSelectedCategory(category._id!);
                    if (isMobileView) {
                      setShowSidebar(false);
                    }
                  }}
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
              ) : (
                articles.map((article) => (
                  <button
                    key={article._id}
                    onClick={() => handleArticleClick(article)}
                    className={`w-full text-left p-2 rounded-lg mb-2 ${selectedArticle?._id === article._id
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{article.title}</span>
                      <span className="text-sm opacity-60">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="flex-1 min-h-screen bg-white overflow-hidden">
        {selectedArticle ? (
          <div className="h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4 lg:p-8 pt-16 lg:pt-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-8">
              {selectedArticle.title}
            </h1>
            <div className="prose max-w-none markdown-content">
              <MarkdownRenderer content={selectedArticle.content} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500 pt-16 lg:pt-0">
            请选择一篇文章
          </div>
        )}
      </div>
    </div>
  );
}