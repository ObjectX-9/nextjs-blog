'use client'

import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { Article, ArticleStatus } from "@/app/model/article";
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
import { useEffect, useState, useRef } from "react";
import Loading from "@/app/Loading";
import { articlesService } from "@/app/business/articles";
import { message } from "antd";
import { socialLinkBusiness } from "@/app/business/social-link";
import { workExperienceBusiness } from "@/app/business/work-experience";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { trackEvent } from "@/lib/analytics";

interface HomePageClientProps {

}

export default function HomePageClient({ }: HomePageClientProps) {
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [workExperiences, setWorkExperiences] = useState<IWorkExperience[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [basicDataLoading, setBasicDataLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSocialLinks = async () => {
    try {
      const socialLinks = await socialLinkBusiness.getSocialLinks();
      setSocialLinks(socialLinks);
    } catch (error) {
      message.error('获取社交链接失败:' + error);
    }
  }

  const fetchWorkExperiences = async () => {
    try {
      const workExperiences = await workExperienceBusiness.getWorkExperiences();
      setWorkExperiences(workExperiences);
    } catch (error) {
      message.error('获取工作经历失败:' + error);
    }
  }

  const fetchArticles = async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    }

    try {
      const response = await articlesService.getArticles({
        page: pageNum,
        limit: 20,
        status: ArticleStatus.PUBLISHED,
        sortBy: 'latest'
      });

      if (isLoadMore) {
        // 追加新数据，但要去重
        setArticles(prev => {
          const existingIds = new Set(prev?.map(article => article._id));
          const newArticles = (response.items as Article[])?.filter(
            article => !existingIds?.has(article._id)
          );
          return [...prev, ...newArticles];
        });
      } else {
        // 设置初始数据
        setArticles(response.items);
      }

      // 使用API返回的分页信息
      if (response.pagination) {
        setHasMore(response.pagination.hasMore);
        setPage(response.pagination.page);
      } else {
        // 兼容旧的逻辑
        setHasMore(response.items.length === 20);
      }
      setIsLoadingMore(false);
    } catch (error) {
      console.error('获取文章失败:', error);
      setIsLoadingMore(false);
    }
  }

  // 加载更多文章
  const loadMoreArticles = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  }

  // 使用 useInfiniteScroll hook
  const scrollContainerRef = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loadMore: loadMoreArticles,
    threshold: 100,
    debounceMs: 150,
  });

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
        message.error('获取数据失败:' + error);
      } finally {
        setBasicDataLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 埋点：首页加载完成（单独 useEffect 避免重复）
  useEffect(() => {
    const tracked = sessionStorage.getItem('_home_tracked');
    if (!tracked) {
      trackEvent('home_page_loaded', { category: 'page' });
      sessionStorage.setItem('_home_tracked', '1');
    }
  }, []);



  // 显示基础数据loading状态
  if (basicDataLoading) {
    return (
      <Loading />
    );
  }

  return (
    <main
      ref={scrollContainerRef}
      className="flex h-screen w-full box-border flex-col overflow-y-auto custom-scrollbar-thin
 py-8 px-8"
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
      {isLoadingMore && (
        <div className="w-full max-w-3xl my-0 mx-auto mt-4 mb-8 flex justify-center">
          <div className="flex items-center space-x-2 text-gray-500">
            <LoadingSpinner className="w-5 h-5" />
            <span>加载更多文章中...</span>
          </div>
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