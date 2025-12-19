"use client";

import { useSiteStore } from "@/store/site";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { Heart, Eye, QrCode, X, Users } from "lucide-react";
import Image from "next/image";
import React from "react";
import StatIndicator from "./StatIndicator";
import Divider from "./Divider";

const LIKE_KEY = "site_liked";

// 图片预览组件
const ImagePreview = memo(({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
        <Image
          src={src}
          alt={alt}
          width={500}
          height={500}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
});

ImagePreview.displayName = 'ImagePreview';

// Web端二维码展示组件
const QrcodePopover = memo(({
  site,
  onClose,
}: {
  site: any;
  onClose: () => void;
}) => {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setPreviewImage({ src, alt });
  }, []);

  return (
    <div className="fixed md:absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl z-[100]">
      <div className="relative p-4">
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45" />
        <div className="flex gap-6">
          {site?.qrcode && (
            <div className="text-center" key="wechat">
              <div
                className="relative w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(site.qrcode, "微信二维码")}
              >
                <Image
                  src={site.qrcode}
                  alt="二维码"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">微信</div>
            </div>
          )}
          {site?.appreciationCode && (
            <div className="text-center" key="appreciation">
              <div
                className="relative w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleImageClick(site.appreciationCode, "赞赏码")
                }
              >
                <Image
                  src={site.appreciationCode}
                  alt="赞赏码"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">赞赏</div>
            </div>
          )}
          {site?.wechatGroup && (
            <div className="text-center" key="group">
              <div
                className="relative w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(site.wechatGroup, "微信公众号")}
              >
                <Image
                  src={site.wechatGroup}
                  alt="微信公众号"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">公众号</div>
            </div>
          )}
        </div>
      </div>
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
});

QrcodePopover.displayName = 'QrcodePopover';

// 移动端二维码展示组件
const QrcodeModal = memo(({ site, onClose }: { site: any; onClose: () => void }) => {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    // 点击背景时关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    onClose();
  }, [onClose]);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setPreviewImage({ src, alt });
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleModalClick}
    >
      <div
        className="relative bg-white rounded-xl w-[90%] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer"
          onClick={handleCloseClick}
        >
          <span className="text-gray-500 text-lg">&times;</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {site?.qrcode && (
            <div className="text-center" key="wechat">
              <div
                className="relative w-28 h-28 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(site.qrcode, "微信二维码")}
              >
                <Image
                  src={site.qrcode}
                  alt="二维码"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">微信</div>
            </div>
          )}
          {site?.appreciationCode && (
            <div className="text-center" key="appreciation">
              <div
                className="relative w-28 h-28 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleImageClick(site.appreciationCode, "赞赏码")
                }
              >
                <Image
                  src={site.appreciationCode}
                  alt="赞赏码"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">赞赏</div>
            </div>
          )}
          {site?.wechatGroup && (
            <div className="text-center" key="group">
              <div
                className="relative w-28 h-28 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(site.wechatGroup, "微信公众号")}
              >
                <Image
                  src={site.wechatGroup}
                  alt="微信公众号"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">公众号</div>
            </div>
          )}
        </div>
      </div>
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
});

QrcodeModal.displayName = 'QrcodeModal';

export const WebRunInfo = () => {
  const { site, updateLikeCount } = useSiteStore();

  const [state, setState] = useState({
    isLiking: false,
    hasLiked: false,
    showQrcode: false,
    isMobile: false
  });

  // 埋点统计数据
  const [analyticsData, setAnalyticsData] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    realtimeCount: 0,
  });

  const qrcodeRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // 检查点赞状态
  useEffect(() => {
    try {
      const likedStatus = localStorage.getItem(LIKE_KEY) === "true";
      setState(prev => ({ ...prev, hasLiked: likedStatus }));
    } catch (error) {
      console.error("Error getting liked status:", error);
    }
  }, []);

  // 获取埋点统计数据
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/stats?range=all');
        const data = await res.json();
        setAnalyticsData({
          pageViews: data.overview?.pageViews || 0,
          uniqueVisitors: data.overview?.uniqueVisitors || 0,
          realtimeCount: data.realtimeCount?.count || 0,
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchAnalytics();
    // 每30秒刷新一次实时在线人数
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);



  // 处理点赞
  const handleLike = useCallback(async () => {
    if (state.isLiking || state.hasLiked) return;

    setState(prev => ({ ...prev, isLiking: true }));
    try {
      await updateLikeCount();
      localStorage.setItem(LIKE_KEY, "true");
      setState(prev => ({ ...prev, hasLiked: true, isLiking: false }));
    } catch (error) {
      console.error("Error liking site:", error);
      setState(prev => ({ ...prev, isLiking: false }));
    }
  }, [state.isLiking, state.hasLiked, updateLikeCount]);

  // 处理鼠标进入
  const handleMouseEnter = useCallback(() => {
    if (!state.isMobile) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setState(prev => ({ ...prev, showQrcode: true }));
    }
  }, [state.isMobile]);

  // 处理鼠标离开
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!state.isMobile && !popoverRef.current?.contains(e.relatedTarget as Node)) {
      closeTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showQrcode: false }));
      }, 2000);
    }
  }, [state.isMobile]);

  // 处理弹出框鼠标离开
  const handlePopoverMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!state.isMobile && !qrcodeRef.current?.contains(e.relatedTarget as Node)) {
      closeTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showQrcode: false }));
      }, 2000);
    }
  }, [state.isMobile]);

  // 处理弹出框鼠标进入
  const handlePopoverMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  // 处理二维码点击
  const handleQrcodeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (state.isMobile) setState(prev => ({ ...prev, showQrcode: true }));
  }, [state.isMobile]);

  // 点击外部关闭二维码
  useEffect(() => {
    if (!state.isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          qrcodeRef.current &&
          !qrcodeRef.current.contains(event.target as Node)
        ) {
          setState(prev => ({ ...prev, showQrcode: false }));
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [state.isMobile]);

  // 计算二维码数量
  const qrcodeCount = useMemo(() => {
    return [site?.qrcode, site?.appreciationCode, site?.wechatGroup].filter(
      Boolean
    ).length;
  }, [site?.qrcode, site?.appreciationCode, site?.wechatGroup]);

  // 判断是否有任何二维码
  const hasAnyQrcode = useMemo(() => qrcodeCount > 0, [qrcodeCount]);

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:overflow-visible py-1">
      <StatIndicator
        icon={<Heart />}
        label="喜欢"
        value={site?.likeCount || 0}
        bgColor={state.hasLiked ? "bg-gray-200" : "bg-[#ff7e95]/20 hover:bg-[#ff7e95]/30"}
        iconColor={state.hasLiked ? "fill-[#ff7e95] text-[#ff7e95]" : "text-[#ff7e95]"}
        onClick={handleLike}
        isDisabled={state.hasLiked}
        title={state.hasLiked ? "您已经点过赞啦" : "点赞支持一下"}
      />

      <Divider />

      <StatIndicator
        icon={<Eye />}
        label="访问人数"
        value={(site?.visitCount || 0) + analyticsData.uniqueVisitors}
        bgColor="bg-blue-500/20"
        iconColor="text-blue-500"
        title={`页面浏览量: ${analyticsData.pageViews}`}
      />

      <Divider />

      <StatIndicator
        icon={<Users />}
        label="在线人数"
        value={analyticsData.realtimeCount}
        bgColor="bg-[#48bfaf]/20"
        iconColor="text-[#48bfaf]"
        title="当前在线人数"
      />

      <Divider />

      {hasAnyQrcode && (
        <div
          className="relative"
          ref={qrcodeRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleQrcodeClick}
          style={{ zIndex: 9 }}
        >
          <StatIndicator
            icon={<QrCode />}
            label="关注我"
            value={qrcodeCount}
            bgColor="bg-purple-500/20 hover:bg-purple-500/30"
            iconColor="text-purple-500"
          />

          {state.showQrcode &&
            (state.isMobile ? (
              <QrcodeModal site={site} onClose={() => setState(prev => ({ ...prev, showQrcode: false }))} />
            ) : (
              <div
                ref={popoverRef}
                onMouseLeave={handlePopoverMouseLeave}
                onMouseEnter={handlePopoverMouseEnter}
              >
                <QrcodePopover
                  site={site}
                  onClose={() => setState(prev => ({ ...prev, showQrcode: false }))}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
