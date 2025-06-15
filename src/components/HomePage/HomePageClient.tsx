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
import { throttle } from "lodash-es";
import Loading from "@/app/Loading";
import { articlesService } from "@/app/business/articles";
import { message } from "antd";
import { socialLinkBusiness } from "@/app/business/social-link";
import { workExperienceBusiness } from "@/app/business/work-experience";

interface HomePageClientProps {

}

export default function HomePageClient({ }: HomePageClientProps) {
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [workExperiences, setWorkExperiences] = useState<IWorkExperience[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [basicDataLoading, setBasicDataLoading] = useState(true);
  const loadingMore = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const mainRef = useRef<HTMLElement>(null);

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
      loadingMore.current = true;
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
      loadingMore.current = false;
    } catch (error) {
      console.error('获取文章失败:', error);
      loadingMore.current = false;
    }
  }

  // 加载更多文章
  const loadMoreArticles = () => {
    if (!loadingMore.current && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  }

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

  // 滚动监听 - 修改为监听main元素
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = throttle(() => {
      const scrollTop = mainElement.scrollTop;
      const clientHeight = mainElement.clientHeight;
      const scrollHeight = mainElement.scrollHeight;

      // 当滚动到距离底部100px时触发加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore.current) {
        loadMoreArticles();
      }
    }, 100);

    // 添加初始化时的高度检查
    const checkInitialHeight = () => {
      const scrollHeight = mainElement.scrollHeight;
      const clientHeight = mainElement.clientHeight;

      // 如果内容高度不足以产生滚动，且还有更多数据，则自动加载
      if (scrollHeight <= clientHeight && hasMore && !loadingMore && articles.length > 0) {
        loadMoreArticles();
      }
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });

    checkInitialHeight();

    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [mainRef.current, page]);

  // 显示基础数据loading状态
  if (basicDataLoading) {
    return (
      <Loading />
    );
  }

  return (
    <main
      ref={mainRef}
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
      {loadingMore.current && (
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