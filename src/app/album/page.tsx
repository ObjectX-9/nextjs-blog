"use client";

import React, { useState, useMemo } from "react";
import { usePhotos } from "@/app/hooks/usePhotos";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorMessage from "./components/ErrorMessage";
import PhotoGrid from "./components/PhotoGrid";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Album() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { photos, loading, error, refetch } = usePhotos();

  // 转换照片数据用于Lightbox
  const lightboxSlides = useMemo(() =>
    photos.map((photo) => ({
      src: photo.src,
      title: photo.title,
      description: photo.location,
    }))
    , [photos]);

  // 处理照片点击
  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index);
  };

  // 关闭Lightbox
  const handleCloseLightbox = () => {
    setSelectedIndex(-1);
  };

  // Loading状态
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error状态
  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

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

      {/* Lightbox弹窗 */}
      <Lightbox
        slides={lightboxSlides}
        open={selectedIndex >= 0}
        index={selectedIndex}
        close={handleCloseLightbox}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        carousel={{
          finite: true,
        }}
        render={{
          buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined,
          buttonNext: lightboxSlides.length <= 1 ? () => null : undefined,
        }}
      />
    </main>
  );
}
