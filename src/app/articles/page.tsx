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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

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
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get('category');
      if (categoryFromUrl) {
        setSelectedCategory(categoryFromUrl);
      } else {
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
      const sortedCategories = data.categories.sort((a: ArticleCategory, b: ArticleCategory) => {
        // 首先按照置顶状态排序
        if (a.isTop !== b.isTop) {
          return b.isTop ? 1 : -1;
        }
        // 其次按照完成状态排序
        if (a.status !== b.status) {
          return a.status === 'completed' ? -1 : 1;
        }
        // 最后按照order和名称排序
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });
      setCategories(sortedCategories);

      const counts: Record<string, number> = {};
      await Promise.all(
        sortedCategories.map(async (category: ArticleCategory) => {
          const articlesResponse = await fetch(`/api/articles?categoryId=${category._id}`);
          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            counts[category._id!] = articlesData.articles?.length || 0;
          }
        })
      );
      setCategoryCounts(counts);

      if (sortedCategories.length > 0) {
        setSelectedCategory(sortedCategories[0]._id);
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
      // 根据 order 和创建时间排序
      const sortedArticles = (data.articles || []).sort((a: Article, b: Article) => {
        if (a.order !== undefined && b.order !== undefined) {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
        } else if (a.order !== undefined) {
          return -1; // a 有 order，b 没有，a 排前面
        } else if (b.order !== undefined) {
          return 1;  // b 有 order，a 没有，b 排前面
        }
        // 如果 order 相同或都没有，按创建时间降序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setArticles(sortedArticles);
      setCategoryCounts(prev => ({
        ...prev,
        [categoryId]: data.articles?.length || 0
      }));
    } catch (error) {
      console.error('获取文章列表失败:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    localStorage.setItem('lastCategory', categoryId);
    if (isMobileView) {
      setCurrentView('articles');
    }
  };

  const handleArticleClick = (article: Article) => {
    if (isMobileView) {
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

  const ArticleSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="p-3 border-b last:border-b-0">
          <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const ArticleSkeletonDesktop = () => (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="p-3 rounded-lg mb-2 bg-gray-50">
          <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const CategorySkeleton = () => (
    <div className="animate-pulse h-full">
      <div className="p-4 border-b">
        <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-3 rounded-lg border border-gray-100">
            <div className="flex gap-1 mb-2">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!categories.length) {
    return (
      <div className="min-h-screen flex">
        <div className="md:hidden w-full">
          <div
            className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <CategorySkeleton />
          </div>
          <div className="fixed inset-0 bg-white">
            <div className="p-4">
              <ArticleSkeleton />
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-full">
          <div className="w-[20vw] min-h-screen border-r bg-white">
            <CategorySkeleton />
          </div>
          <div className="flex-1 pl-8 bg-white">
            <div className="p-4">
              <div className="h-7 bg-gray-200 rounded w-1/4 mb-6"></div>
              <ArticleSkeletonDesktop />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderMobileView = () => (
    <div className="w-full">
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'}`}
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
                  className="w-full text-left p-3 border-b last:border-b-0 relative group hover:bg-gray-50"
                >
                  <div className="absolute left-0 top-0 flex gap-1">
                    {category.isTop && (
                      <span className="text-[10px] font-medium bg-gray-300 text-white px-1.5 py-0.5 rounded">
                        置顶
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-300 text-white`}>
                      {category.status === 'completed' ? '已完成' : '进行中'}
                    </span>
                  </div>
                  <div className="flex items-center min-h-[40px]">
                    <span className="text-base font-medium truncate">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'articles' ? 'translate-x-0' : 'translate-x-full'}`}
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
            <ArticleSkeleton />
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
  );

  const renderDesktopView = () => (
    <div className="flex w-full">
      <div className="w-[20vw] border-r bg-white">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <nav className="p-4">
            <h2 className="text-lg font-bold mb-4">技术文档</h2>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategorySelect(category._id!)}
                className={`w-full text-left p-3 rounded-lg mb-2 relative group border ${selectedCategory === category._id
                  ? "bg-black text-white border-transparent"
                  : "hover:bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="absolute left-0 top-0 flex gap-1">
                  {category.isTop && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedCategory === category._id
                      ? 'bg-white/25 text-white'
                      : 'bg-gray-300 text-white hover:bg-gray-500'
                      }`}>
                      置顶
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedCategory === category._id
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-300 text-white hover:bg-gray-500'
                    }`}>
                    {category.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
                <div className="flex items-center justify-between min-h-[40px]">
                  <span className="text-base truncate mr-2">{category.name}</span>
                  <span className={`text-sm ${selectedCategory === category._id
                    ? 'text-white/60'
                    : 'text-gray-400'
                    }`}>
                    {categoryCounts[category._id!] || 0} 篇
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 border-r pl-8 bg-white">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <nav className="p-4">
            <h2 className="text-lg font-bold mb-4">
              {categories.find(c => c._id === selectedCategory)?.name || '所有文章'}
            </h2>
            {loading ? (
              <ArticleSkeletonDesktop />
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
    </div>
  );

  return (
    <div className="min-h-screen w-full flex relative">
      {isMobileView ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
