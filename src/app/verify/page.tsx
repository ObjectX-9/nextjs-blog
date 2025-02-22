"use client";

import { useSiteStore } from "@/store/site";
import { useEffect, useState } from "react";
import { Spin } from "antd";

interface CaptchaInfo {
  id: string;
  expiresAt: Date;
  code: string;
}

export default function VerifyPage() {
  const { site } = useSiteStore();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState(false);
  const [captchaInfo, setCaptchaInfo] = useState<CaptchaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取验证码信息
  useEffect(() => {
    const fetchCaptchaInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 先尝试获取可用的验证码
        const response = await fetch("/api/captcha/available", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success && data.captcha) {
          // 如果有可用的验证码，直接使用
          setCaptchaInfo({
            id: data.captcha.id,
            expiresAt: new Date(data.captcha.expiresAt),
            code: data.captcha.code,
          });
        } else {
          // 如果没有可用的验证码，创建新的
          const newCaptchaResponse = await fetch("/api/captcha", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "ALPHANUMERIC",
              target: "verify-page",
            }),
          });

          const newData = await newCaptchaResponse.json();
          if (!newCaptchaResponse.ok || !newData.success) {
            throw new Error(newData.message || "生成验证码失败");
          }

          setCaptchaInfo({
            id: newData.captcha.id,
            expiresAt: new Date(newData.captcha.expiresAt),
            code: newData.captcha.code,
          });
        }
      } catch (error) {
        console.error("获取验证码信息失败:", error);
        setError(error instanceof Error ? error.message : "获取验证码信息失败");
        setCaptchaInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaptchaInfo();
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
        <div className="py-12 text-gray-400">
          <Spin tip="加载中..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-12 text-red-400">
          <div className="mb-2">验证码获取失败</div>
          <div className="text-sm">{error}</div>
        </div>
      );
    }

    if (!site?.isOpenVerifyArticle) {
      return <div className="py-12 text-gray-400">文章验证功能未开启</div>;
    }

    if (!captchaInfo?.code) {
      return <div className="py-12 text-gray-400">暂无可用的验证码</div>;
    }

    return (
      <>
        {/* 验证码显示 */}
        <div className="mb-6 sm:mb-8 relative group">
          <div
            onClick={handleCopy}
            className="text-4xl sm:text-6xl font-mono tracking-wider text-gray-100 p-4 sm:p-6 bg-black rounded-lg select-all break-all cursor-pointer transition-colors hover:bg-gray-600 relative"
          >
            {captchaInfo?.code || "加载中..."}

            {/* 复制提示 - 悬浮时显示 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 text-white text-base sm:text-lg rounded-lg transition-opacity">
              点击复制验证码
            </div>
          </div>

          {/* 复制成功提示 */}
          {showCopyTip && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm">
              复制成功
            </div>
          )}
        </div>

        {/* 倒计时显示 */}
        <div className="space-y-2 sm:space-y-4">
          <div className="text-base sm:text-lg text-gray-300">
            剩余有效期：
            <span className="text-gray-100 font-medium ml-2">
              {remainingTime}
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg text-center overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-black text-white py-4 px-6">
          <h1 className="text-xl sm:text-2xl font-medium">验证码信息</h1>
        </div>

        <div className="p-4 sm:p-8">{renderContent()}</div>

        {/* 底部信息 */}
        <div className="bg-gray-700 py-3 px-4 text-xs sm:text-sm text-red-400 border-t border-gray-600">
          {error
            ? "请刷新页面重试"
            : captchaInfo
            ? "验证码过期后将自动失效"
            : "请联系管理员获取新的验证码"}
        </div>
      </div>
    </div>
  );
}
