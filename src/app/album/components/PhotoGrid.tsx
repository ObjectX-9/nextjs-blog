import React from 'react';
import { IPhoto } from '@/app/model/photo';
import MobilePhotoCard from './MobilePhotoCard';

interface PhotoGridProps {
    photos: IPhoto[];
    onPhotoClick: (index: number) => void;
}

// 桌面端照片卡片组件
interface DesktopPhotoCardProps {
    photo: IPhoto;
    index: number;
    onClick: () => void;
}

const DesktopPhotoCard: React.FC<DesktopPhotoCardProps> = ({ photo, onClick }) => {
    const handleClick = () => {
        console.log('照片被点击:', photo.title);
        onClick();
    };

    return (
        <div
            className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            onClick={handleClick}
        >
            {/* 图片 */}
            <div className="relative w-full h-0 pb-[75%]"> {/* 4:3 比例 */}
                <img
                    src={photo.src}
                    alt={photo.title || '照片'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Hover覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                    {/* 标题 */}
                    {photo.title && (
                        <h3 className="text-white font-medium text-sm mb-2 drop-shadow-sm">
                            {photo.title}
                        </h3>
                    )}

                    <div className="space-y-1">
                        {/* 地点信息 */}
                        {photo.location && (
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{photo.location}</span>
                            </div>
                        )}

                        {/* 相机信息 */}
                        {photo.exif?.Make && photo.exif?.Model && (
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0013 4H7a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{photo.exif.Make} {photo.exif.Model}</span>
                            </div>
                        )}

                        {/* 拍摄参数 */}
                        {photo.exif && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {photo.exif.FocalLength && (
                                    <span className="text-white/90 text-xs font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                        {photo.exif.FocalLength}
                                    </span>
                                )}
                                {photo.exif.Aperture && (
                                    <span className="text-white/90 text-xs font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                        f/{photo.exif.Aperture}
                                    </span>
                                )}
                                {photo.exif.ShutterSpeed && (
                                    <span className="text-white/90 text-xs font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                        {photo.exif.ShutterSpeed}
                                    </span>
                                )}
                                {photo.exif.ISO && (
                                    <span className="text-white/90 text-xs font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                        ISO{photo.exif.ISO}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
    // 如果没有照片，显示空状态
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                {/* 空状态图标 */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    {/* 装饰性元素 */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* 空状态文字 */}
                <div className="text-center space-y-3 max-w-sm">
                    <h3 className="text-xl font-semibold text-gray-900">暂无照片</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        还没有上传任何照片，开始记录你的精彩生活吧！
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span>支持 JPG、PNG</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span>自动提取 EXIF</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* 移动端显示 */}
            <div className="block lg:hidden space-y-4">
                {photos.map((photo, i) => (
                    <MobilePhotoCard
                        key={photo._id!}
                        photo={photo}
                        onClick={() => onPhotoClick(i)}
                    />
                ))}
            </div>

            {/* 桌面端显示 - 响应式网格布局 */}
            <div className="hidden lg:block w-full max-w-[2000px] mx-auto">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {photos.map((photo, index) => (
                        <DesktopPhotoCard
                            key={photo._id!}
                            photo={photo}
                            index={index}
                            onClick={() => onPhotoClick(index)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default React.memo(PhotoGrid); 