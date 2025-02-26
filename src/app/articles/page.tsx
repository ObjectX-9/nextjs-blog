'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleCategory } from '@/app/model/article';
import { ArticleSkeleton, ArticleSkeletonDesktop, CategorySkeleton } from './components/Skeletons';
import { MobileView } from './components/MobileView';
import { DesktopView } from './components/DesktopView';

export default function ArticlesPage() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
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

  const fetchAllArticles = useCallback(async () => {
    const response = await fetch('/api/articles?status=published');
    if (!response.ok) {
      throw new Error('获取文章列表失败');
    }
    const data = await response.json();
    const sortedArticles = sortArticles(data.articles || []);
    setAllArticles(sortedArticles);
  }, []);

  const fetchCategories = useCallback(async () => {
    const response = await fetch('/api/articles/categories');
    if (!response.ok) {
      throw new Error('获取分类列表失败');
    }
    const data = await response.json();
    const sortedCategories = data.categories.sort((a: ArticleCategory, b: ArticleCategory) => {
      if (a.isTop !== b.isTop) {
        return b.isTop ? 1 : -1;
      }
      if (a.status !== b.status) {
        return a.status === 'completed' ? -1 : 1;
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
    setCategories(sortedCategories);
  }, []);

  useEffect(() => {
    if (allArticles.length && categories.length) {
      const counts: Record<string, number> = {};
      categories.forEach((category) => {
        counts[category._id!] = allArticles.filter(article => article.categoryId === category._id).length;
      });
      setCategoryCounts(counts);
    }
  }, [allArticles, categories]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await fetchAllArticles();
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
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allArticles.filter(article => article.categoryId === selectedCategory);
      const sorted = sortArticles(filtered);
      setFilteredArticles(sorted);
    }
  }, [selectedCategory, allArticles]);

  const sortArticles = (articles: Article[]) => {
    return [...articles].sort((a: Article, b: Article) => {
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

  if (!categories.length) {
    return (
      <div className="w-full flex">
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
    <MobileView
      currentView={currentView}
      categories={categories}
      selectedCategory={selectedCategory}
      loading={loading}
      filteredArticles={filteredArticles}
      handleCategorySelect={handleCategorySelect}
      handleBack={handleBack}
      handleArticleClick={handleArticleClick}
    />
  );

  const renderDesktopView = () => (
    <DesktopView
      categories={categories}
      selectedCategory={selectedCategory}
      loading={loading}
      filteredArticles={filteredArticles}
      categoryCounts={categoryCounts}
      handleCategorySelect={handleCategorySelect}
      handleArticleClick={handleArticleClick}
    />
  );

  return (
    <div className="min-h-screen w-full flex relative">
      {isMobileView ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
