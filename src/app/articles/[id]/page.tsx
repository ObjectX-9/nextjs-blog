"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Article } from "@/app/model/article";
import "@/styles/markdown.css";
import { useParams, useRouter } from "next/navigation";
import { useSiteStore } from "@/store/site";
import Image from "next/image";
import { useLocalCache } from "@/app/hooks/useLocalCache";
import { articlesService } from "@/app/business/articles";
import { verifyService } from "@/app/business/verify";
import { scrollToHeading } from "@/utils/heading-utils";

// 动态导入 MarkdownRenderer 组件，禁用 SSR
const MarkdownRenderer = dynamic(
  () => import("@/components/customMdRender/core/MarkdownRenderer").then(mod => ({ default: mod.MarkdownRenderer })),
  {
    ssr: false,
    loading: () => (
      <div className="prose max-w-none">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }
);

// 缓存键常量
const CACHE_KEYS = {
  LAST_CATEGORY: 'lastCategory',
  ARTICLE_VERIFICATION: 'article_verification'
};

interface VerificationState {
  verified: boolean;
  expireTime: number;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToc, setShowToc] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const router = useRouter();

  // 验证码相关状态
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // 站点配置
  const { site } = useSiteStore();
  const { getFromCache, setCache, clearCache } = useLocalCache();

  const hasUpdatedView = useRef(false);

  // 检测移动端视图
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (isMobile) {
        // 添加 viewport meta 标签
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
          );
        }
      }
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

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
        setIsHeaderVisible(true); // 向上滚动，显示
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 加载文章
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articleData = await articlesService.getArticle(params.id as string);
        // 设置文章数据
        setArticle(articleData);

        // 使用 ref 来防止重复更新
        if (!hasUpdatedView.current) {
          hasUpdatedView.current = true;

          setTimeout(() => {
            articlesService.updateArticleViews(params.id as string);
          }, 500);
        }

      } catch (error) {
        console.error("获取文章失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }

    // 清理函数
    return () => {
      // 在组件卸载时不需要清理sessionStorage，因为它是基于会话的
    };
  }, [params.id, getFromCache, setCache]);

  // 验证码相关状态
  useEffect(() => {
    const checkVerification = () => {
      // 如果未开启验证，直接设置为已验证状态
      if (!site?.isOpenVerifyArticle) {
        setIsVerified(true);
        setShowVerification(false);
        return;
      }

      const storedVerification = getFromCache<VerificationState>(CACHE_KEYS.ARTICLE_VERIFICATION);
      if (storedVerification) {
        const verification: VerificationState = storedVerification;
        if (verification.expireTime > Date.now()) {
          setIsVerified(true);
          setShowVerification(false);
          return;
        } else {
          clearCache(CACHE_KEYS.ARTICLE_VERIFICATION);
        }
      }
      setShowVerification(true);
    };

    checkVerification();
  }, [site?.isOpenVerifyArticle]);

  // 验证码校验
  const handleVerification = async () => {
    if (!verificationCode) {
      setVerificationError("请输入验证码");
      return;
    }

    try {
      // 先获取可用的验证码并检查输入的验证码是否匹配
      const availableResult = await verifyService.getAvailableCaptcha();

      if (!availableResult.success || !availableResult.captcha) {
        setVerificationError("当前没有可用的验证码，请联系管理员");
        return;
      }

      // 检查验证码是否匹配
      if (availableResult.captcha.code !== verificationCode) {
        setVerificationError("验证码不正确，请重新输入");
        return;
      }

      // 检查验证码状态
      if (availableResult.captcha.isActivated) {
        setVerificationError("验证码已被使用或已激活，请获取新的验证码");
        return;
      }

      // 验证验证码（这会激活验证码并返回过期时间）
      const verifyResult = await verifyService.verifyCaptcha(availableResult.captcha._id!);

      if (!verifyResult.success) {
        setVerificationError("验证码状态更新失败，请重试");
        return;
      }

      setIsVerified(true);
      setShowVerification(false);
      setVerificationError("");
      setVerificationCode("");

      // 存储验证状态
      const verification: VerificationState = {
        verified: true,
        expireTime: verifyResult.expireTime,
      };
      setCache(CACHE_KEYS.ARTICLE_VERIFICATION, verification);
    } catch (error) {
      console.error("验证过程出错:", error);
      setVerificationError("验证过程出错，请稍后重试");
    }
  };

  // 骨架屏组件
  const ArticleSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="h-12 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  // 目录骨架屏组件
  const TocSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 30 + 60}%` }}
          ></div>
        ))}
      </div>
    </div>
  );

  const renderVerificationModal = () => {
    // 如果未开启验证或已验证，不显示验证模态框
    if (!site?.isOpenVerifyArticle || !showVerification) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[400px] relative">
          {/* 关闭按钮 */}
          <button
            onClick={() => router.back()}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-8">
            {/* 标题部分 */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-normal mb-2">
                扫码关注公众号：
                <span className="text-black">{site?.wechatGroupName}</span>
              </h2>
              <p className="text-base mb-1">
                发送:{" "}
                <span className="text-black">《{site?.wechatKeyword}》</span>
              </p>
              <p className="text-base">即可解锁本站全部文章</p>
            </div>

            {/* 二维码部分 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              {site && site.wechatGroup ? (
                <div className="relative w-[200px] h-[200px] mx-auto">
                  <Image
                    src={site.wechatGroup}
                    alt="微信群二维码"
                    fill
                    sizes="200px"
                    className="object-contain"
                    priority={true}
                    unoptimized={true}
                  />
                </div>
              ) : (
                <div className="w-[200px] h-[200px] mx-auto flex items-center justify-center text-gray-400">
                  加载中...
                </div>
              )}
            </div>

            {/* 验证码输入部分 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleVerification}
                className="px-6 py-2 bg-black text-white rounded hover:bg-[#ff7875] transition-colors"
              >
                提交
              </button>
            </div>

            {verificationError && (
              <p className="text-[#ff4d4f] text-sm mt-2 text-center">
                {verificationError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderArticleContent = () => {
    if (!article) return null;

    // 如果未开启验证或已验证，显示全部内容
    if (!site?.isOpenVerifyArticle || isVerified) {
      return (
        <MarkdownRenderer content={article.content} isMobile={isMobileView} />
      );
    }

    // 如果需要验证且未验证，只显示部分内容
    const previewContent =
      article.content.split("\n").slice(0, 10).join("\n") +
      "\n\n...\n\n> 请完成验证后继续阅读";
    return (
      <MarkdownRenderer content={previewContent} isMobile={isMobileView} />
    );
  };

  const renderMobileView = () => {
    if (!article) return null;
    return (
      <div className="fixed inset-0 flex flex-col">
        {/* 返回按钮 */}
        <button
          onClick={() => window.history.back()}
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
          className={`fixed top-0 left-0 right-0 bg-white z-10 transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold mb-4 text-center truncate px-12">
              {article.title}
            </h1>

            {/* 目录切换按钮 */}
            <button
              onClick={() => setShowToc(!showToc)}
              className="flex items-center text-gray-600 hover:text-black mb-2"
            >
              <svg
                className={`w-4 h-4 mr-2 transition-transform ${showToc ? "rotate-0" : "-rotate-90"
                  }`}
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
              className={`bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 ${showToc ? "max-h-64" : "max-h-0"
                }`}
            >
              <div className="p-4">
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin">
                  {article?.content
                    ?.split("\n")
                    .filter((line) => line.startsWith("#"))
                    .map((heading, index) => {
                      const level = heading.match(/^#+/)?.[0].length || 1;
                      const text = heading.replace(/^#+\s+/, "");
                      // Toast UI Editor 生成的 ID 规则：转换为小写，空格和特殊字符替换为连字符
                      const headingId = text
                        .toLowerCase()
                        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      return (
                        <div
                          key={index}
                          className={`text-gray-700 hover:text-black cursor-pointer`}
                          style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                          onClick={() => {
                            scrollToHeading(text);
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
        <div className="flex-1 overflow-y-auto custom-scrollbar-thin pt-24 pb-20">
          <div className="p-4">
            <div className="prose max-w-none">{renderArticleContent()}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopView = () => {
    if (!article) return null;
    return (
      // 桌面端样式
      <div className="relative min-h-screen w-full">
        {/* 右侧固定目录 */}
        <div
          className={`fixed top-0 right-0 w-[20vw] h-screen bg-white shadow-lg transition-transform duration-300 ${showSidebar ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="sticky top-0 h-screen overflow-y-auto custom-scrollbar-thin">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">目录</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 border-b">
              <button
                onClick={() => {
                  const lastCategory = getFromCache<string>(CACHE_KEYS.LAST_CATEGORY);
                  router.push(
                    `/articles${lastCategory ? `?category=${lastCategory}` : ""
                    }`
                  );
                }}
                className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                返回文章列表
              </button>
            </div>
            <nav className="p-6 space-y-1.5">
              {article?.content
                ?.split("\n")
                .filter((line) => line.startsWith("#"))
                .map((heading, index) => {
                  const level = heading.match(/^#+/)?.[0].length || 1;
                  const text = heading.replace(/^#+\s+/, "");
                  // Toast UI Editor 生成的 ID 规则：转换为小写，空格和特殊字符替换为连字符
                  const headingId = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  return (
                    <div
                      key={index}
                      className={`group flex items-center py-1.5 ${level === 1
                        ? "text-gray-900 font-medium"
                        : "text-gray-600"
                        } hover:text-blue-600 cursor-pointer text-sm transition-colors duration-150 ease-in-out`}
                      style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                      onClick={() => {
                        scrollToHeading(text);
                      }}
                      title={text}
                    >
                      <span className="truncate">{text}</span>
                    </div>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div
          className={`transition-[margin] duration-300 ${showSidebar ? "mr-[20vw]" : "mr-0"
            } border-r h-screen overflow-y-auto custom-scrollbar-thin`}
        >
          <div className="max-w-4xl mx-auto py-8 px-8 relative">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="fixed right-4 top-4 bg-white p-2 rounded-full shadow-lg text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-4xl font-bold mb-8">{article.title}</h1>
            {renderArticleContent()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full">
        {isMobileView ? (
          // 移动端骨架屏
          <div className="fixed inset-0 flex flex-col">
            <div className="fixed top-0 left-0 right-0 bg-white z-10">
              <div className="p-4 border-b">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar-thin pt-24 pb-20">
              <div className="p-4">
                <ArticleSkeleton />
              </div>
            </div>
          </div>
        ) : (
          // 桌面端骨架屏
          <div className="relative min-h-screen w-full">
            {/* 右侧固定目录骨架屏 */}
            <div className="fixed top-0 right-0 w-[20vw] h-screen bg-white shadow-lg">
              <div className="sticky top-0 h-screen overflow-y-auto custom-scrollbar-thin">
                <div className="p-6 border-b">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                <TocSkeleton />
              </div>
            </div>

            {/* 主要内容区域骨架屏 */}
            <div className="mr-[20vw] border-r h-screen overflow-y-auto custom-scrollbar-thin">
              <div className="max-w-4xl mx-auto py-8 px-8">
                <ArticleSkeleton />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        文章不存在
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {renderVerificationModal()}
      {isMobileView ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
