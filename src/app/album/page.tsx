"use client";

import React, { useState } from "react";
import { usePhotos } from "@/app/hooks/usePhotos";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorMessage from "./components/ErrorMessage";
import PhotoGrid from "./components/PhotoGrid";
import CustomLightbox from "./components/CustomLightbox";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader
        title="生活相册"
        description={`记录生活中的美好时刻${photos.length > 0 ? `，共 ${photos.length} 张照片` : ''}`}
      />

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
