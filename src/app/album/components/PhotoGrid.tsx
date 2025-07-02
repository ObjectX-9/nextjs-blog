import React from 'react';
import Image from 'next/image';
import { IPhoto } from '@/app/model/photo';
import MobilePhotoCard from './MobilePhotoCard';
import Masonry from 'react-masonry-css';

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
            className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white mb-4"
            onClick={handleClick}
        >
            {/* 图片容器 */}
            <div className="relative overflow-hidden rounded-xl">
                <Image
                    src={photo.src}
                    alt={photo.title || '照片'}
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                    width={photo.width}
                    height={photo.height}
                    style={{
                        aspectRatio: `${photo.width} / ${photo.height}`,
                        display: 'block'
                    }}
                    priority={false}
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                {/* Hover信息层 */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {/* 标题 */}
                    {photo.title && (
                        <h3 className="text-white font-semibold text-sm mb-2 drop-shadow-lg line-clamp-2">
                            {photo.title}
                        </h3>
                    )}

                    <div className="space-y-2">
                        {/* 图片尺寸信息 */}
                        <div className="flex items-center gap-2 text-white/90 text-xs">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{photo.width} × {photo.height}</span>
                        </div>

                        {/* 地点信息 */}
                        {photo.location && (
                            <div className="flex items-center gap-2 text-white/90 text-xs">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate font-medium">{photo.location}</span>
                            </div>
                        )}

                        {/* 相机信息 */}
                        {photo.exif?.Make && photo.exif?.Model && (
                            <div className="flex items-center gap-2 text-white/90 text-xs">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0013 4H7a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate font-medium">{photo.exif.Make} {photo.exif.Model}</span>
                            </div>
                        )}

                        {/* 拍摄参数 */}
                        {photo.exif && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {photo.exif.FocalLength && (
                                    <span className="text-white/95 text-xs font-mono bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
                                        {photo.exif.FocalLength}
                                    </span>
                                )}
                                {photo.exif.Aperture && (
                                    <span className="text-white/95 text-xs font-mono bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
                                        f/{photo.exif.Aperture}
                                    </span>
                                )}
                                {photo.exif.ShutterSpeed && (
                                    <span className="text-white/95 text-xs font-mono bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
                                        {photo.exif.ShutterSpeed}
                                    </span>
                                )}
                                {photo.exif.ISO && (
                                    <span className="text-white/95 text-xs font-mono bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
                                        ISO{photo.exif.ISO}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 宽高比标识 */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-black/40 backdrop-blur-sm rounded px-2 py-1 border border-white/20">
                        <span className="text-white text-xs font-mono">
                            {(photo.width / photo.height).toFixed(2)}:1
                        </span>
                    </div>
                </div>

                {/* 装饰性图标 */}
                <div className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center border border-white/20">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
    // 瀑布流断点配置
    const breakpointColumnsObj = {
        default: 6,  // 默认6列
        2200: 5,     // 2200px以下5列
        1600: 4,     // 1600px以下4列
        1200: 3,     // 1200px以下3列
        768: 2,      // 768px以下2列
        576: 1       // 576px以下1列
    };

    // 如果没有照片，显示空状态
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100">
                {/* 空状态图标 */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-blue-100/50">
                        <svg
                            className="w-14 h-14 text-blue-400"
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
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* 浮动装饰 */}
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/25 animate-pulse"></div>
                </div>

                {/* 空状态文字 */}
                <div className="text-center space-y-4 max-w-md">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">精彩待续</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        还没有照片记录，开始捕捉生活中的美好瞬间吧！
                    </p>

                    {/* 功能提示 */}
                    <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
                        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-gray-700 font-medium">高质量图片</span>
                            <span className="text-gray-500 text-xs">JPG、PNG格式</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-gray-700 font-medium">智能解析</span>
                            <span className="text-gray-500 text-xs">自动EXIF信息</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* 移动端显示 */}
            <div className="block lg:hidden space-y-6">
                {photos.map((photo, i) => (
                    <MobilePhotoCard
                        key={photo._id!}
                        photo={photo}
                        onClick={() => onPhotoClick(i)}
                    />
                ))}
            </div>

            {/* 桌面端瀑布流显示 */}
            <div className="hidden lg:block w-full max-w-[2000px] mx-auto">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="flex w-auto -ml-4"
                    columnClassName="pl-4 bg-clip-padding"
                >
                    {photos.map((photo, index) => (
                        <DesktopPhotoCard
                            key={photo._id!}
                            photo={photo}
                            index={index}
                            onClick={() => onPhotoClick(index)}
                        />
                    ))}
                </Masonry>
            </div>
        </>
    );
};

export default React.memo(PhotoGrid); 