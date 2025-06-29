"use client";

import { ITimelineEvent } from "@/app/model/timeline";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const Tweet = dynamic(() => import("react-tweet").then((mod) => mod.Tweet), {
  ssr: false,
});

export function TimelineEvent({ event }: { event: ITimelineEvent }) {
  const router = useRouter();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const imageClickedRef = useRef(false);

  const handleEventClick = (e: React.MouseEvent) => {
    // 如果图片刚被点击，不执行跳转
    if (imageClickedRef.current) {
      imageClickedRef.current = false;
      return;
    }

    if (event.ossPath && event._id) {
      router.push(`/timeline/${event._id}`);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    imageClickedRef.current = true; // 标记图片被点击了
    setShowImagePreview(true);
  };

  const hasDetailContent = event.ossPath && event._id;

  return (
    <div
      className={`group relative flex gap-4 sm:gap-8 pb-12 sm:pb-16 ${hasDetailContent ? 'cursor-pointer rounded-lg p-4 -m-4 transition-colors' : ''
        }`}
      onClick={hasDetailContent ? handleEventClick : undefined}
    >
      {/* Month circle and connecting line */}
      <div className="flex-none relative flex flex-col items-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-medium">
          {monthNames[event.month - 1]}
        </div>
        <div className="absolute top-8 sm:top-10 bottom-0 w-[1px] bg-gray-200 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        {/* 标题和标签行 */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
            {event.title}
          </h2>

          {/* 标签组 */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDetailContent && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                📖 详情
              </span>
            )}

            {event.location && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <MapPin size={12} className="mr-1" />
                {event.location}
              </span>
            )}

            {event.isAdminOnly && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                🔒 私密
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-base sm:text-lg mb-3 leading-relaxed">
          {event.description}
        </p>

        {/* Links */}
        {event.links && event.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {event.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                🔗 {link.text}
              </a>
            ))}
          </div>
        )}

        {/* Tweet */}
        {event.tweetUrl && (
          <div className="mt-3 w-full sm:w-3/4 max-w-2xl">
            <Tweet id={event.tweetUrl.split("/").pop() || ""} />
          </div>
        )}

        {/* Image */}
        {event.imageUrl && (
          <div className="mt-3 w-full sm:w-3/4 max-w-2xl" data-image-area>
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 cursor-pointer">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
              {/* 透明覆盖层，确保点击事件被正确捕获 */}
              <div
                className="absolute inset-0 w-full h-full z-10"
                onClick={handleImageClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* 图片预览模态框 */}
      {showImagePreview && event.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowImagePreview(false)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图片容器 */}
          <div className="relative max-w-6xl max-h-[90vh] flex items-center justify-center">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
