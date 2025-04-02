import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  isMobile?: boolean;
}

/**
 * 图片预览组件，支持桌面端和移动端
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isMobile = false
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageClick = (img: string) => {
    setPreviewImage(img);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <div
        className={`grid ${isMobile ? 'gap-1.5 mb-2' : 'gap-2 mb-3'} ${images.length === 1
            ? "grid-cols-1 " + (isMobile ? "max-w-lg" : "max-w-3xl")
            : images.length === 2
              ? "grid-cols-2 " + (isMobile ? "max-w-md" : "max-w-2xl")
              : "grid-cols-2 " + (isMobile ? "" : "sm:grid-cols-3") + " " + (isMobile ? "max-w-md" : "max-w-3xl")
          } mx-auto`}
      >
        {images.slice(0, 4).map((img, index) => (
          <div
            key={index}
            className={`relative w-full ${images.length === 1
                ? isMobile
                  ? "min-h-[200px] max-h-[300px]"
                  : "min-h-[280px] sm:min-h-[320px] max-h-[400px]"
                : isMobile
                  ? "min-h-[140px] max-h-[200px]"
                  : "min-h-[160px] sm:min-h-[200px] max-h-[280px]"
              } cursor-pointer`}
            onClick={() => handleImageClick(img)}
          >
            <Image
              src={img}
              alt={`Image ${index + 1}`}
              fill
              loading="lazy"
              className="rounded-lg object-contain"
              sizes={
                images.length === 1
                  ? isMobile
                    ? "(max-width: 640px) 85vw, 500px"
                    : "(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 800px"
                  : isMobile
                    ? "(max-width: 640px) 42vw, 250px"
                    : "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 400px"
              }
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.jpg"; // 添加一个占位图
              }}
            />
          </div>
        ))}
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closePreview}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={closePreview}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="relative w-full h-full">
              <Image
                src={previewImage}
                alt="预览图片"
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
