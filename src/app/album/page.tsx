"use client";

import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IPhotoDB } from "@/app/model/photo";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Album() {
  const [index, setIndex] = useState(-1);
  const [photos, setPhotos] = useState<IPhotoDB[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos");
        const data = await response.json();
        if (data.success) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchPhotos();
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
