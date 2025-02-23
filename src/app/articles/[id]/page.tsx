"use client";

import { useState, useEffect } from "react";
import { Article } from "@/app/model/article";
import { MarkdownRenderer } from "@/components/customMdRender/core/MarkdownRenderer";
import "@/styles/markdown.css";
import { useParams, useRouter } from "next/navigation";
import { useSiteStore } from "@/store/site";
import Image from "next/image";

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
        const response = await fetch(`/api/articles?id=${params.id}`);
        if (!response.ok) {
          throw new Error("获取文章失败");
        }
        const data = await response.json();
        setArticle(data);

        // 增加浏览量
        await fetch(`/api/articles/${params.id}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("获取文章失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  // 验证码相关状态
  useEffect(() => {
    const checkVerification = () => {
      // 如果未开启验证，直接设置为已验证状态
      if (!site?.isOpenVerifyArticle) {
        setIsVerified(true);
        setShowVerification(false);
        return;
      }

      const storedVerification = localStorage.getItem("article_verification");
      if (storedVerification) {
        const verification: VerificationState = JSON.parse(storedVerification);
        if (verification.expireTime > Date.now()) {
          setIsVerified(true);
          setShowVerification(false);
          return;
        } else {
          localStorage.removeItem("article_verification");
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
      // 通过验证码查询状态
      const response = await fetch(
        `/api/captcha/available?code=${verificationCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("🚀 ~ handleVerification ~ data:", data);

      if (data.success && data.captcha) {
        // 更新验证码状态为激活
        const activateResponse = await fetch(
          `/api/captcha/${data.captcha._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: data.captcha.code, // 使用从查询结果中获取的code
              target: "article_verification",
              isActivated: true,
              activatedAt: new Date().toISOString(),
              activationExpiryHours: 24, // 设置24小时的激活有效期
            }),
          }
        );

        const activateData = await activateResponse.json();
        console.log("🚀 ~ handleVerification ~ activateData:", activateData);
        if (!activateData.success) {
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
          expireTime: activateData.expireTime,
        };
        localStorage.setItem(
          "article_verification",
          JSON.stringify(verification)
        );
      } else {
        setVerificationError(data.message || "验证码无效，请重试");
      }
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
          className={`fixed top-0 left-0 right-0 bg-white z-10 transition-transform duration-300 ${
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
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
                className={`w-4 h-4 mr-2 transition-transform ${
                  showToc ? "rotate-0" : "-rotate-90"
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
              className={`bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 ${
                showToc ? "max-h-64" : "max-h-0"
              }`}
            >
              <div className="p-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {article?.content
                    ?.split("\n")
                    .filter((line) => line.startsWith("#"))
                    .map((heading, index) => {
                      const level = heading.match(/^#+/)?.[0].length || 1;
                      const text = heading.replace(/^#+\s+/, "");
                      return (
                        <div
                          key={index}
                          className={`text-gray-700 hover:text-black cursor-pointer`}
                          style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                          onClick={() => {
                            const element = document.getElementById(
                              text.toLowerCase().replace(/\s+/g, "-")
                            );
                            element?.scrollIntoView({ behavior: "smooth" });
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
        <div className="flex-1 overflow-y-auto pt-24 pb-20">
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
          className={`fixed top-0 right-0 w-[20vw] h-screen bg-white shadow-lg transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="sticky top-0 h-screen overflow-y-auto">
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
                  const lastCategory = localStorage.getItem("lastCategory");
                  router.push(
                    `/articles${
                      lastCategory ? `?category=${lastCategory}` : ""
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
                  return (
                    <div
                      key={index}
                      className={`group flex items-center py-1.5 ${
                        level === 1
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      } hover:text-blue-600 cursor-pointer text-sm transition-colors duration-150 ease-in-out`}
                      style={{ paddingLeft: `${(level - 1) * 1}rem` }}
                      onClick={() => {
                        const element = document.getElementById(
                          text.toLowerCase().replace(/\s+/g, "-")
                        );
                        element?.scrollIntoView({ behavior: "smooth" });
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
          className={`transition-[margin] duration-300 ${
            showSidebar ? "mr-[20vw]" : "mr-0"
          } border-r h-screen overflow-y-auto`}
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
            <div className="flex-1 overflow-y-auto pt-24 pb-20">
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
              <div className="sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                <TocSkeleton />
              </div>
            </div>

            {/* 主要内容区域骨架屏 */}
            <div className="mr-[20vw] border-r h-screen overflow-y-auto">
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
