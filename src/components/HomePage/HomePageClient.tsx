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
import { useEffect, useState, useCallback, useRef } from "react";
import { throttle, debounce, DebouncedFunc } from "lodash-es";
import Loading from "@/app/Loading";
import { request } from '@/utils/request';
import { articlesService } from "@/app/business/articles";

interface HomePageClientProps {

}

export default function HomePageClient({ }: HomePageClientProps) {
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [workExperiences, setWorkExperiences] = useState<IWorkExperience[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [basicDataLoading, setBasicDataLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const mainRef = useRef<HTMLElement>(null);

  // 使用useRef存储debounced函数，避免重复创建
  const debouncedLoadMoreRef = useRef<DebouncedFunc<() => void> | null>(null);

  const fetchSocialLinks = async () => {
    try {
      const response = await request.get<{ socialLinks: ISocialLink[] }>('social-links');
      setSocialLinks(response.data.socialLinks);
    } catch (error) {
      console.error('获取社交链接失败:', error);
    }
  }

  const fetchWorkExperiences = async () => {
    try {
      const response = await request.get<{ workExperiences: IWorkExperience[] }>('work-experience');
      setWorkExperiences(response.data.workExperiences);
    } catch (error) {
      console.error('获取工作经历失败:', error);
    }
  }

  const fetchArticles = useCallback(async (page: number, isLoadMore: boolean) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }

      // 首页明确指定获取已发布的文章，并按最新时间排序
      const response = await articlesService.getArticles(
        {
          page,
          limit: 20,
          status: ArticleStatus.PUBLISHED,  // 只获取已发布的文章
          sortBy: 'latest'      // 按最新时间排序
        }
      );
      if (isLoadMore) {
        // 使用 Set 来去重，防止重复数据
        setArticles(prev => {
          const existingIds = new Set(prev.map(article => article._id as string)) as Set<string>;
          const newArticles = response.items.filter(article => !existingIds.has(article._id as string));
          return [...prev, ...newArticles];
        });
      } else {
        setArticles(response.items);
      }

      setHasMore(response.pagination.hasMore);

    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  }, []); // 空依赖数组，因为函数内部使用的都是稳定的函数和state更新器

  // 更新debounced函数
  useEffect(() => {
    debouncedLoadMoreRef.current = debounce(() => {
      if (!loadingMore && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchArticles(nextPage, true);
      }
    }, 300);

    return () => {
      debouncedLoadMoreRef.current?.cancel();
    };
  }, [page, loadingMore, hasMore, fetchArticles]);

  // 加载更多文章
  const loadMoreArticles = useCallback(() => {
    debouncedLoadMoreRef.current?.();
  }, []);

  // 滚动监听main元素
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = throttle(() => {
      const scrollTop = mainElement.scrollTop;
      const clientHeight = mainElement.clientHeight;
      const scrollHeight = mainElement.scrollHeight;

      // 当滚动到距离底部100px时触发加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore) {
        loadMoreArticles();
      }
    }, 100); // 减少滚动事件频率

    // 添加初始化时的高度检查
    const checkInitialHeight = throttle(() => {
      const scrollHeight = mainElement.scrollHeight;
      const clientHeight = mainElement.clientHeight;

      // 如果内容高度不足以产生滚动，且还有更多数据，则自动加载
      if (scrollHeight <= clientHeight && hasMore && !loadingMore && articles.length > 0) {
        loadMoreArticles();
      }
    }, 100);

    mainElement.addEventListener('scroll', handleScroll, { passive: true });

    checkInitialHeight();

    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
    };
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
  }, [fetchArticles]);

  // 显示基础数据loading状态
  if (basicDataLoading) {
    return (
      <Loading />
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