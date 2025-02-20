"use client";

import { useSiteStore } from "@/store/site";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const { site } = useSiteStore();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState(false);

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
    if (!site?.verificationCode) return;

    try {
      await navigator.clipboard.writeText(site.verificationCode);
      setShowCopyTip(true);
      setTimeout(() => setShowCopyTip(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  useEffect(() => {
    const updateRemainingTime = () => {
      if (!site?.verificationCodeCreateTime) return;

      const createTime = new Date(site.verificationCodeCreateTime).getTime();
      const expirationHours = site.verificationCodeExpirationTime || 24;
      const expirationTime = createTime + expirationHours * 60 * 60 * 1000;
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
  }, [
    site?.verificationCodeCreateTime,
    site?.verificationCodeExpirationTime,
    isMobile,
  ]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg text-center overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-black text-white py-4 px-6">
          <h1 className="text-xl sm:text-2xl font-medium">验证码信息</h1>
        </div>

        <div className="p-4 sm:p-8">
          {site?.verificationCode ? (
            <>
              {/* 验证码显示 */}
              <div className="mb-6 sm:mb-8 relative group">
                <div
                  onClick={handleCopy}
                  className="text-4xl sm:text-6xl font-mono tracking-wider text-gray-100 p-4 sm:p-6 bg-black rounded-lg select-all break-all cursor-pointer transition-colors hover:bg-gray-600 relative"
                >
                  {site.verificationCode}

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
          ) : (
            <div className="py-12 text-gray-400">暂无可用的验证码</div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="bg-gray-700 py-3 px-4 text-xs sm:text-sm text-red-400 border-t border-gray-600">
          验证码 {site?.verificationCodeExpirationTime || 24} 小时内有效
        </div>
      </div>
    </div>
  );
}
