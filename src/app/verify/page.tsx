"use client";

import { useSiteStore } from "@/store/site";
import { useEffect, useState, useRef } from "react";
import { verifyService } from "@/app/business/verify";

interface CaptchaInfo {
  id: string;
  expiresAt: Date;
  code: string;
}

// 冷却时间常量（毫秒）
const COOLDOWN_PERIOD = 10000; // 10秒
const LAST_REFRESH_KEY = 'verify_last_refresh_time';

export default function VerifyPage() {
  const { site } = useSiteStore();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState(false);
  const [captchaInfo, setCaptchaInfo] = useState<CaptchaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const hasInitialized = useRef(false);
  const lastRefreshTime = useRef<number>(0);
  const cooldownInterval = useRef<NodeJS.Timeout | null>(null);

  // 从localStorage获取上次刷新时间
  useEffect(() => {
    try {
      const storedTime = localStorage.getItem(LAST_REFRESH_KEY);
      if (storedTime) {
        const parsedTime = parseInt(storedTime, 10);
        if (!isNaN(parsedTime) && parsedTime > 0) {
          lastRefreshTime.current = parsedTime;

          // 检查是否仍在冷却期
          const now = Date.now();
          const elapsed = now - parsedTime;
          if (elapsed < COOLDOWN_PERIOD) {
            const remaining = Math.ceil((COOLDOWN_PERIOD - elapsed) / 1000);
            setRefreshCooldown(remaining);

            // 启动冷却倒计时
            startCooldownTimer();
          }
        }
      }
    } catch (err) {
      console.error("读取localStorage失败:", err);
    }
  }, []);

  // 启动冷却计时器
  const startCooldownTimer = () => {
    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
    }

    cooldownInterval.current = setInterval(() => {
      setRefreshCooldown(prev => {
        if (prev <= 1) {
          if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
            cooldownInterval.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 更新上次刷新时间
  const updateLastRefreshTime = (time: number) => {
    lastRefreshTime.current = time;
    try {
      localStorage.setItem(LAST_REFRESH_KEY, time.toString());
    } catch (err) {
      console.error("写入localStorage失败:", err);
    }
  };

  // 获取验证码信息
  const fetchCaptchaInfo = async (force = false) => {
    // 防止重复调用
    if (isLoading) return;

    // 检查冷却时间，除非强制刷新
    const now = Date.now();
    if (!force && lastRefreshTime.current > 0) {
      const elapsed = now - lastRefreshTime.current;

      if (elapsed < COOLDOWN_PERIOD) {
        const remaining = Math.ceil((COOLDOWN_PERIOD - elapsed) / 1000);
        setRefreshCooldown(remaining);

        // 启动冷却倒计时
        startCooldownTimer();
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setRefreshCooldown(0);

    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
      cooldownInterval.current = null;
    }

    try {
      // 直接生成新的验证码
      const createResult = await verifyService.generateVerifyPageCaptcha();

      if (!createResult.success || !createResult.captcha) {
        throw new Error("生成验证码失败");
      }

      setCaptchaInfo({
        id: createResult.captcha._id!,
        expiresAt: new Date(createResult.captcha.expiresAt),
        code: createResult.captcha.code,
      });

      // 记录刷新时间
      updateLastRefreshTime(Date.now());
    } catch (error) {
      setError(error instanceof Error ? error.message : "获取验证码信息失败");
      setCaptchaInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // 检查是否在冷却期
      const now = Date.now();
      const elapsed = now - lastRefreshTime.current;
      const isInCooldown = lastRefreshTime.current > 0 && elapsed < COOLDOWN_PERIOD;

      if (!isInCooldown) {
        fetchCaptchaInfo(true); // 初始化时强制刷新，但仅当不在冷却期时
      }
    } else {
      console.log("⚠️ 已经初始化过了，跳过");
    }

    // 组件卸载时清理定时器
    return () => {
      if (cooldownInterval.current) {
        clearInterval(cooldownInterval.current);
      }
    };
  }, []);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 复制验证码
  const handleCopy = async () => {
    if (!captchaInfo?.code) return;

    try {
      await navigator.clipboard.writeText(captchaInfo.code);
      setShowCopyTip(true);
      setTimeout(() => setShowCopyTip(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  useEffect(() => {
    const updateRemainingTime = () => {
      if (!captchaInfo) return;

      const expirationTime = captchaInfo.expiresAt.getTime();
      const now = Date.now();
      const remaining = expirationTime - now;

      if (remaining <= 0) {
        setRemainingTime("已过期");
        // 验证码过期时，自动获取新的验证码（防止重复调用）
        if (!isLoading) {
          fetchCaptchaInfo(true); // 过期时强制刷新
        }
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

      if (isMobile) {
        setRemainingTime(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setRemainingTime(`${hours}小时${minutes}分${seconds}秒`);
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [captchaInfo, isMobile]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-10 h-10 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600 text-sm font-medium">正在生成验证码...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-gray-900 font-medium mb-2">获取失败</div>
          <div className="text-gray-500 text-sm mb-6">{error}</div>
          <button
            onClick={() => fetchCaptchaInfo(true)} // 错误时强制刷新
            disabled={refreshCooldown > 0}
            className={`inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 transition-all shadow-md hover:shadow-lg ${refreshCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshCooldown > 0 ? `请等待 ${refreshCooldown}秒` : '重新获取'}
          </button>
        </div>
      );
    }

    if (!site?.isOpenVerifyArticle) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-gray-900 font-medium mb-2">功能未开启</div>
          <div className="text-gray-500 text-sm">文章验证功能当前处于关闭状态</div>
        </div>
      );
    }

    if (!captchaInfo?.code) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-gray-900 font-medium mb-2">暂无验证码</div>
          <div className="text-gray-500 text-sm mb-4">请联系管理员获取新的验证码</div>

          {refreshCooldown > 0 && (
            <div className="text-amber-600 text-sm mt-2">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                请等待 {refreshCooldown} 秒后再尝试刷新
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 验证码显示 */}
        <div className="text-center">
          <div className="text-sm text-gray-600 font-medium mb-4 uppercase tracking-wide">您的验证码</div>
          <div
            onClick={handleCopy}
            className="relative group p-8 bg-white hover:bg-gray-50 border border-gray-200 rounded cursor-pointer transition-all duration-300 select-all shadow-sm hover:shadow-md"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-[0.3em] text-gray-800 mb-3 break-all">
              {captchaInfo?.code || "加载中..."}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center font-medium">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              点击复制
            </div>

            {/* 复制成功提示 */}
            {showCopyTip && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 rounded transform transition-all duration-300 scale-100">
                <div className="text-white text-sm font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制到剪贴板
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 倒计时显示 */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">有效期</span>
            </div>
            <div className="font-mono font-medium text-gray-800">
              {remainingTime}
            </div>
          </div>
        </div>

        {/* 刷新按钮 */}
        <div className="text-center">
          <button
            onClick={() => fetchCaptchaInfo()}
            disabled={refreshCooldown > 0 || isLoading}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-colors ${(refreshCooldown > 0 || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshCooldown > 0 ? `${refreshCooldown}秒后可刷新` : '刷新验证码'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-0">
      {/* 内容区域 - 占满整个屏幕 */}
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          {/* 主卡片 */}
          <div className="bg-white shadow-md border border-gray-200 rounded overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="bg-gray-800 text-white py-5 px-6 relative">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold">验证码信息</h1>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 md:p-8">
              {renderContent()}
            </div>

            {/* 底部信息 */}
            <div className="bg-gray-50 py-4 px-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {error
                    ? "请刷新页面重试"
                    : captchaInfo
                      ? "验证码过期后将自动失效"
                      : "请联系管理员获取新的验证码"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
