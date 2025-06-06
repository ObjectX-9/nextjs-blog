"use client";

import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IPhotoDB } from "@/app/model/photo";
import { useLocalCache } from "@/app/hooks/useLocalCache";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// 缓存键常量
const CACHE_KEYS = {
  PHOTOS: 'album_photos',
  LAST_FETCH: 'album_last_fetch',
};

// 缓存时间设置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
const REFRESH_INTERVAL = 30000; // 30秒

export default function Album() {
  const [index, setIndex] = useState(-1);
  const [photos, setPhotos] = useState<IPhotoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFromCache, setCache } = useLocalCache(CACHE_DURATION);

  const shouldFetchData = (): boolean => {
    const lastFetch = getFromCache<{timestamp: number}>(CACHE_KEYS.LAST_FETCH);
    if (!lastFetch) return true;
    return Date.now() - lastFetch.timestamp > REFRESH_INTERVAL;
  };

  const updateLastFetchTime = (): void => {
    setCache(CACHE_KEYS.LAST_FETCH, { timestamp: Date.now() });
  };

  const fetchPhotos = async (force: boolean = false) => {
    if (!force && !shouldFetchData()) {
      return;
    }

    try {
      const response = await fetch("/api/photos");
      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos);
        setCache(CACHE_KEYS.PHOTOS, data.photos);
        updateLastFetchTime();
      } else {
        throw new Error('Failed to fetch photos');
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      // 如果请求失败，尝试使用缓存
      const cached = getFromCache<IPhotoDB[]>(CACHE_KEYS.PHOTOS);
      if (cached) {
        setPhotos(cached);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to fetch photos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首先尝试使用缓存数据
    const cached = getFromCache<IPhotoDB[]>(CACHE_KEYS.PHOTOS);
    if (cached) {
      setPhotos(cached);
      setLoading(false);
    }
    
    // 检查是否需要获取新数据
    fetchPhotos(true);

    // 每30秒尝试刷新一次
    const interval = setInterval(() => fetchPhotos(false), REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  // 移动端展示组件
  const MobilePhotoCard = ({
    photo,
    onClick,
  }: {
    photo: IPhotoDB;
    onClick: () => void;
  }) => (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="relative pb-[66.67%]">
        <Image
          src={photo.src}
          alt={photo.title || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      </div>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl pb-[66.67%] relative"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
        <h1 className="text-3xl font-bold mb-8">生活相册</h1>
        <div className="text-red-500">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-8">生活相册</h1>
      <div className="mb-6 last:mb-0">
        这里是我的生活相册，记录了我的生活中的美好时刻。
      </div>

      {/* 移动端显示 */}
      <div className="block lg:hidden">
        {photos.map((photo, i) => (
          <MobilePhotoCard
            key={photo._id!.toString()}
            photo={photo}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {/* 桌面端显示 - 保持原有布局 */}
      <div className="hidden lg:block photo-album-container w-full max-w-[2000px] mx-auto">
        <PhotoAlbum
          layout="masonry"
          photos={photos.map((photo) => ({
            src: photo.src,
            width: photo.width,
            height: photo.height,
            title: photo.title,
          }))}
          spacing={10}
          columns={4}
          onClick={({ index }) => setIndex(index)}
        />
      </div>

      <Lightbox
        slides={photos.map((photo) => ({
          src: photo.src,
          title: photo.title,
          description: photo.location,
        }))}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
      />
    </main>
  );
}
