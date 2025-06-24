import React, { useMemo } from 'react';
import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import { IPhoto } from '@/app/model/photo';
import MobilePhotoCard from './MobilePhotoCard';

interface PhotoGridProps {
    photos: IPhoto[];
    onPhotoClick: (index: number) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
    // 转换照片数据格式用于PhotoAlbum组件
    const albumPhotos = useMemo(() =>
        photos.map((photo) => ({
            src: photo.src,
            width: photo.width,
            height: photo.height,
            title: photo.title,
        }))
        , [photos]);

    // 如果没有照片，显示空状态
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-medium text-gray-900">暂无照片</h3>
                    <p className="text-gray-500 text-sm">还没有上传任何照片</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* 移动端显示 */}
            <div className="block lg:hidden">
                {photos.map((photo, i) => (
                    <MobilePhotoCard
                        key={photo._id!}
                        photo={photo}
                        onClick={() => onPhotoClick(i)}
                    />
                ))}
            </div>

            {/* 桌面端显示 */}
            <div className="hidden lg:block photo-album-container w-full max-w-[2000px] mx-auto">
                <PhotoAlbum
                    layout="masonry"
                    photos={albumPhotos}
                    spacing={10}
                    columns={4}
                    onClick={({ index }) => onPhotoClick(index)}
                />
            </div>
        </>
    );
};

export default React.memo(PhotoGrid); 