"use client";

import React, { useState } from "react";
import { usePhotos } from "@/app/hooks/usePhotos";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorMessage from "./components/ErrorMessage";
import PhotoGrid from "./components/PhotoGrid";
import CustomLightbox from "./components/CustomLightbox";

export default function Album() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { photos, loading, error, refetch } = usePhotos();

  // 处理照片点击
  const handlePhotoClick = (index: number) => {
    console.log('相册页面收到点击事件，索引:', index);
    console.log('设置selectedIndex为:', index);
    console.log('当前photos数组长度:', photos.length);
    setSelectedIndex(index);
  };

  // 关闭Lightbox
  const handleCloseLightbox = () => {
    setSelectedIndex(-1);
  };

  // 处理索引变化
  const handleIndexChange = (index: number) => {
    setSelectedIndex(index);
  };

  // Loading状态
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error状态
  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  console.log('渲染相册页面，selectedIndex:', selectedIndex, 'isOpen:', selectedIndex >= 0);

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      {/* 页面头部 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">生活相册</h1>
        <p className="text-gray-600 mb-2">
          这里是我的生活相册，记录了我的生活中的美好时刻。
        </p>
        {photos.length > 0 && (
          <p className="text-sm text-gray-500">
            共 {photos.length} 张照片
          </p>
        )}
      </header>

      {/* 照片网格 */}
      <PhotoGrid
        photos={photos}
        onPhotoClick={handlePhotoClick}
      />

      {/* 自定义 Lightbox */}
      <CustomLightbox
        photos={photos}
        currentIndex={selectedIndex}
        isOpen={selectedIndex >= 0}
        onClose={handleCloseLightbox}
        onIndexChange={handleIndexChange}
      />
    </main>
  );
}
