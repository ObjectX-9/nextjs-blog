'use client';

import { useState, useEffect } from 'react';
import { Article, ArticleCategory } from '@/app/model/article';
import { MarkdownRenderer } from '@/components/customMdRender/core/MarkdownRenderer';
import '@/styles/markdown.css';

const DesktopArticlesPage = ({
  categories,
  selectedCategory,
  articles,
  loading,
  selectedArticle,
  handleCategorySelect,
  handleArticleClick
}: {
  categories: ArticleCategory[];
  selectedCategory: string | null;
  articles: Article[];
  loading: boolean;
  selectedArticle: Article | null;
  handleCategorySelect: (categoryId: string) => void;
  handleArticleClick: (article: Article) => void;
}) => {
  return (
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

      {/* 文章内容 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedArticle ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>
            <div className="prose max-w-none">
              <MarkdownRenderer content={selectedArticle.content} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            请选择一篇文章
          </div>
        )}
      </div>
    </div>
  );
};

const MobileArticlesPage = ({
  categories,
  selectedCategory,
  articles,
  loading,
  selectedArticle,
  currentView,
  showToc,
  isHeaderVisible,
  handleCategorySelect,
  handleArticleClick,
  handleBack,
  setShowToc
}: {
  categories: ArticleCategory[];
  selectedCategory: string | null;
  articles: Article[];
  loading: boolean;
  selectedArticle: Article | null;
  currentView: 'categories' | 'articles' | 'detail';
  showToc: boolean;
  isHeaderVisible: boolean;
  handleCategorySelect: (categoryId: string) => void;
  handleArticleClick: (article: Article) => void;
  handleBack: () => void;
  setShowToc: (show: boolean) => void;
}) => {
  return (
    <div className="w-full">
      {/* 分类视图 */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">技术文档分类</h2>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category._id!)}
              className="w-full text-left p-3 border-b last:border-b-0"
            >
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表视图 */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'articles' ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* 返回按钮 */}
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
          ) : (
            articles.map((article) => (
              <button
                key={article._id}
                onClick={() => handleArticleClick(article)}
                className="w-full text-left p-3 border-b last:border-b-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{article.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 文章详情视图 */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'detail' ? 'translate-x-0' : 'translate-x-full'
          } overflow-y-auto`}
      >
        {selectedArticle && (
          <>
            {/* 移动端返回按钮 */}
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

            {/* 固定在顶部的标题和目录 */}
            <div
              className={`fixed top-0 left-0 right-0 bg-white z-10 mt-4 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold mb-4 text-center">{selectedArticle.title}</h1>

                {/* 目录切换按钮 */}
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="flex items-center text-gray-600 hover:text-black mb-2"
                >
                  <svg
                    className={`w-4 h-4 mr-2 transition-transform ${showToc ? 'rotate-0' : '-rotate-90'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  目录
                </button>

                {/* 文章目录 */}
                <div
                  className={`bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 ${showToc ? 'max-h-64' : 'max-h-0'
                    }`}
                >
                  <div className="p-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedArticle?.content?.split('\n')
                        .filter(line => line.startsWith('#'))
                        .map((heading, index) => {
                          const level = heading.match(/^#+/)?.[0].length || 1;
                          const text = heading.replace(/^#+\s+/, '');
                          return (
                            <div
                              key={index}
                              className={`text-gray-700 hover:text-black cursor-pointer`}
                              style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                              onClick={() => {
                                const element = document.getElementById(text.toLowerCase().replace(/\s+/g, '-'));
                                element?.scrollIntoView({ behavior: 'smooth' });
                                setShowToc(false);
                              }}
                            >
                              {text}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="p-4 mt-[127px]">
              <div className="prose max-w-none">
                <MarkdownRenderer content={selectedArticle.content} isMobile={true} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'articles' | 'detail'>('categories');
  const [showToc, setShowToc] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchArticles(selectedCategory);
    }
  }, [selectedCategory]);

  // 检测滚动方向和距离
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setIsHeaderVisible(true);
        return;
      }

      if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false); // 向下滚动，隐藏
      } else {
        setIsHeaderVisible(true);  // 向上滚动，显示
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (isMobileView) {
      setCurrentView('articles');
    }
  };

  const handleArticleClick = async (article: Article) => {
    try {
      setSelectedArticle(article);
      if (isMobileView) {
        setCurrentView('detail');
      }
      // 增加浏览量
      await fetch(`/api/articles/${article._id}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
  };

  const handleBack = () => {
    if (currentView === 'detail') {
      setCurrentView('articles');
    } else if (currentView === 'articles') {
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
        <MobileArticlesPage
          categories={categories}
          selectedCategory={selectedCategory}
          articles={articles}
          loading={loading}
          selectedArticle={selectedArticle}
          currentView={currentView}
          showToc={showToc}
          isHeaderVisible={isHeaderVisible}
          handleCategorySelect={handleCategorySelect}
          handleArticleClick={handleArticleClick}
          handleBack={handleBack}
          setShowToc={setShowToc}
        />
      ) : (
        <DesktopArticlesPage
          categories={categories}
          selectedCategory={selectedCategory}
          articles={articles}
          loading={loading}
          selectedArticle={selectedArticle}
          handleCategorySelect={handleCategorySelect}
          handleArticleClick={handleArticleClick}
        />
      )}
    </div>
  );
}