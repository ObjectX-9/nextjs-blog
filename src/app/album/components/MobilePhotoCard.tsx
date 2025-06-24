import React from 'react';
import Image from 'next/image';
import { IPhoto } from '@/app/model/photo';

interface MobilePhotoCardProps {
    photo: IPhoto;
    onClick: () => void;
}

const MobilePhotoCard: React.FC<MobilePhotoCardProps> = ({ photo, onClick }) => {
    return (
        <div
            className="relative bg-white rounded-xl shadow-sm overflow-hidden mb-4 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
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
                {(photo.title || photo.location) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        {photo.title && (
                            <h3 className="text-white font-medium text-sm mb-1">{photo.title}</h3>
                        )}
                        {photo.location && (
                            <p className="text-white/80 text-xs">{photo.location}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MobilePhotoCard); 