'use client'

import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { Article } from "@/app/model/article";
import HomeHeader from "@/components/HomePage/HomeHeader";
import AuthorIntro from "@/components/HomePage/AuthorIntro";
import { ListSection } from "@/components/HomePage/ListSection";
import { Section } from "@/components/HomePage/Section";
import { SocialLinks } from "@/components/HomePage/SocialLinks";
import { WorkExperience } from "@/components/HomePage/WorkExperience";
import { Education } from "@/components/HomePage/Education";
import { WebRunInfo } from '@/components/HomePage/WebRunInfo'
import { WebControlInfo } from '@/components/HomePage/WebControlInfo'
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { calculateDuration } from "@/utils/time";
import { useEffect, useState, useCallback, useRef } from "react";

interface HomePageClientProps {
  
}

export default function HomePageClient({
 
}: HomePageClientProps) {
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [workExperiences, setWorkExperiences] = useState<IWorkExperience[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [basicDataLoading, setBasicDataLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const mainRef = useRef<HTMLElement>(null);

  const fetchSocialLinks = async () => {
    const response = await fetch('/api/social-links');
    const data = await response.json();
    console.log('✅ ✅ ✅ ~  social links data:', data);
    setSocialLinks(data.socialLinks as ISocialLink[]);
  }

  const fetchWorkExperiences = async () => {
    const response = await fetch('/api/work-experiences');
    const data = await response.json();
    console.log('✅ ✅ ✅ ~  work experiences data:', data);
    setWorkExperiences(data);
  }

  const fetchArticles = async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    }
    
    try {
      const response = await fetch(`/api/articles?page=${pageNum}&limit=20&status=published`);
      const data = await response.json();
      console.log('✅ ✅ ✅ ~  articles data:', data);
      
      if (isLoadMore) {
        // 追加新数据，但要去重
        setArticles(prev => {
          const existingIds = new Set(prev.map(article => article._id));
          const newArticles = (data.articles as Article[]).filter(
            article => !existingIds.has(article._id)
          );
          console.log(`添加${newArticles.length}篇新文章，过滤了${data.articles.length - newArticles.length}篇重复文章`);
          return [...prev, ...newArticles];
        });
      } else {
        // 设置初始数据
        setArticles(data.articles as Article[]);
      }
      
      // 使用API返回的分页信息
      if (data.pagination) {
        setHasMore(data.pagination.hasMore);
      } else {
        // 兼容旧的逻辑
        setHasMore(data.articles.length === 20);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  }

  // 加载更多文章
  const loadMoreArticles = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  }, [page, loadingMore, hasMore]);

  // 滚动监听 - 修改为监听main元素
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const scrollTop = mainElement.scrollTop;
      const clientHeight = mainElement.clientHeight;
      const scrollHeight = mainElement.scrollHeight;
      
      console.log('滚动事件触发', { 
        scrollTop, 
        clientHeight, 
        scrollHeight, 
        hasMore, 
        loadingMore,
        isNearBottom: scrollTop + clientHeight >= scrollHeight - 100
      });
      
      // 当滚动到距离底部100px时触发加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore) {
        console.log('✅ 触底加载更多');
        loadMoreArticles();
      }
    };

    // 添加初始化时的高度检查
    const checkInitialHeight = () => {
      const scrollHeight = mainElement.scrollHeight;
      const clientHeight = mainElement.clientHeight;
      console.log('初始高度检查', { scrollHeight, clientHeight, needsMoreContent: scrollHeight <= clientHeight });
      
      // 如果内容高度不足以产生滚动，且还有更多数据，则自动加载
      if (scrollHeight <= clientHeight && hasMore && !loadingMore && articles.length > 0) {
        console.log('📏 内容高度不够，自动加载更多');
        loadMoreArticles();
      }
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // 检查初始高度
    setTimeout(checkInitialHeight, 100);
    
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [loadMoreArticles, hasMore, loadingMore, articles.length]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setBasicDataLoading(true);
        // 并行获取基础数据，文章单独处理分页
        await Promise.all([
          fetchSocialLinks(),
          fetchWorkExperiences(),
          fetchArticles(1, false) // 初始加载第一页文章
        ]);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setBasicDataLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 显示基础数据loading状态
  if (basicDataLoading) {
    return (
      <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse mb-24"></div>

        <div className="w-full max-w-3xl my-0 mx-auto">
          {/* 作者介绍骨架屏 */}
          <div className="animate-pulse mb-8">
            <div className="flex items-center mb-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full mr-4"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          <div className="max-w-2xl">
            {/* 社交账号骨架屏 */}
            <div className="mb-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* 运行信息骨架屏 */}
            <div className="mb-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>

            {/* 网站信息骨架屏 */}
            <div className="mb-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>

            {/* 教育经历骨架屏 */}
            <div className="mb-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* 工作经历骨架屏 */}
            <div className="mb-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* 技术文章骨架屏 */}
            <div className="animate-pulse mt-8">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main 
      ref={mainRef}
      className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8"
    >
      <HomeHeader />

      <div className="w-full max-w-3xl my-0 mx-auto mt-24">
        <AuthorIntro />
        <div className="max-w-2xl">
          <Section title="社交账号">
            <SocialLinks links={socialLinks} />
          </Section>

          <Section title="运行信息">
            <WebRunInfo />
          </Section>

          <Section title="网站信息">
            <WebControlInfo />
          </Section>

          <Section title="教育经历">
            <Education />
          </Section>
          <Section title="工作经历">
            <WorkExperience
              experiences={workExperiences}
              calculateDuration={calculateDuration}
            />
          </Section>
        </div>
      </div>
      
      <ListSection
        title="📚 技术文章"
        titleLink="/articles"
        items={articles}
      />
      
      {/* 加载更多指示器 */}
      {loadingMore && (
        <div className="w-full max-w-3xl my-0 mx-auto mt-4 mb-8 flex justify-center">
          <div className="flex items-center space-x-2 text-gray-500">
            <LoadingSpinner className="w-5 h-5" />
            <span>加载更多文章中...</span>
          </div>
        </div>
      )}
      
      {/* 手动加载更多按钮 */}
      {!loadingMore && hasMore && articles.length > 0 && (
        <div className="w-full max-w-3xl my-0 mx-auto mt-4 mb-8 flex justify-center">
          <button
            onClick={loadMoreArticles}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            手动加载更多 ({articles.length} 篇)
          </button>
        </div>
      )}
      
      {/* 没有更多内容提示 */}
      {!hasMore && articles.length > 0 && (
        <div className="w-full max-w-3xl my-0 mx-auto mt-4 mb-8 flex justify-center">
          <div className="text-gray-500 text-sm">
            已显示所有文章 (共 {articles.length} 篇)
          </div>
        </div>
      )}
    </main>
  );
} 