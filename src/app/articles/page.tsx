'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleCountByCategory, ArticleStatus } from '@/app/model/article';
import { ArticleSkeleton, ArticleSkeletonDesktop, CategorySkeleton } from './components/Skeletons';
import { MobileView } from './components/MobileView';
import { DesktopView } from './components/DesktopView';
import { articlesService } from '../business/articles';

export default function ArticlesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'articles'>('categories');
  const [categories, setCategories] = useState<ArticleCountByCategory[]>([]);
  const [cacheArticles, setCacheArticles] = useState<Record<string, Article[]>>({});
  const [curSelectArticles, setCurSelectArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchArticles = useCallback(async (categoryId: string) => {
    if (!categoryId) return [];

    if (cacheArticles[categoryId]) {
      return cacheArticles[categoryId];
    }


    const response = await articlesService.getArticles({
      categoryId,
      limit: 100,
      status: ArticleStatus.PUBLISHED, // 只获取已发布的文章
      sortBy: 'order'     // 按order排序
    });

    setCacheArticles((prev) => ({ ...prev, [categoryId]: response.items }));

    return response.items || [];
  }, [cacheArticles]);

  const initArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await articlesService.getArticleCountByCategory();
      setCategories(response);

      const firstCategoryId = response[0]?.categoryId;
      if (firstCategoryId) {
        setSelectedCategory(firstCategoryId);

        const articles = await fetchArticles(firstCategoryId);

        // 确保设置正确的文章列表
        setCurSelectArticles(articles);
      }
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchArticles]);

  useEffect(() => {
    initArticles();
  }, []);

  const handleCategorySelect = useCallback(async (categoryId: string) => {
    console.log('handleCategorySelect被调用:', categoryId, '当前选中:', selectedCategory, '是否移动端:', isMobileView);

    // 在移动端，即使是同一分类也要切换视图
    if (selectedCategory === categoryId && !isMobileView) {
      console.log('桌面端重复选择同一分类，返回');
      return;
    }

    // 立即更新选中的分类和清空文章列表
    setSelectedCategory(categoryId);
    setCurSelectArticles([]);

    // 更新 URL 参数
    const url = new URL(window.location.href);
    url.searchParams.set('category', categoryId);
    window.history.replaceState({}, '', url.toString());

    try {
      // 如果是同一分类且是移动端，直接使用缓存的文章
      if (selectedCategory === categoryId && isMobileView && cacheArticles[categoryId]) {
        console.log('移动端同一分类，使用缓存文章');
        setCurSelectArticles(cacheArticles[categoryId]);
      } else {
        console.log('获取文章数据');
        const articles = await fetchArticles(categoryId);
        // 直接设置文章列表
        setCurSelectArticles(articles);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      setCurSelectArticles([]);
    }

    if (isMobileView) {
      console.log('移动端切换到文章视图');
      setCurrentView('articles');
    }
  }, [fetchArticles, isMobileView, selectedCategory, cacheArticles]);

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
      <div className="w-full">
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
      filteredArticles={curSelectArticles}
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
      filteredArticles={curSelectArticles}
      handleCategorySelect={handleCategorySelect}
      handleArticleClick={handleArticleClick}
    />
  );

  return (
    <div className="w-full">
      {isMobileView ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
