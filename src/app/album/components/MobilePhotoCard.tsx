import React from 'react';
import Image from 'next/image';
import { IPhoto } from '@/app/model/photo';

interface MobilePhotoCardProps {
    photo: IPhoto;
    onClick: () => void;
}

const MobilePhotoCard: React.FC<MobilePhotoCardProps> = ({ photo, onClick }) => {
    const handleClick = () => {
        console.log('移动端照片被点击:', photo.title);
        onClick();
    };

    // 格式化拍摄参数
    const formatShootingParams = () => {
        if (!photo.exif) return null;

        const params: string[] = [];
        if (photo.exif.focalLength) params.push(photo.exif.focalLength);
        if (photo.exif.aperture) params.push(`f/${photo.exif.aperture}`);
        if (photo.exif.shutterSpeed) params.push(photo.exif.shutterSpeed);
        if (photo.exif.iso) params.push(`ISO${photo.exif.iso}`);

        return params.length > 0 ? params.join(' · ') : null;
    };

    const shootingParams = formatShootingParams();

    return (
        <div
            className="relative bg-white rounded-xl shadow-sm overflow-hidden mb-4 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            aria-label={`查看照片: ${photo.title}`}
        >
            <div className="relative pb-[66.67%]">
                <Image
                    src={photo.src}
                    alt={photo.title || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />

                {/* 照片信息覆盖层 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    {photo.title && (
                        <h3 className="text-white font-medium text-sm mb-2">{photo.title}</h3>
                    )}

                    <div className="space-y-1">
                        {photo.location && (
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {photo.location}
                            </div>
                        )}

                        {photo.exif?.camera && (
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0013 4H7a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                {photo.exif.camera}
                            </div>
                        )}

                        {shootingParams && (
                            <div className="text-white/80 text-xs font-mono bg-black/20 px-2 py-1 rounded inline-block">
                                {shootingParams}
                            </div>
                        )}
                    </div>

                    {/* 标签 */}
                    {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {photo.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {photo.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full">
                                    +{photo.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MobilePhotoCard); 