import React, { useState } from 'react';
import Image from 'next/image';
import { IPhoto } from '@/app/model/photo';
import PhotoInfo from './PhotoInfo';

interface MobileLightboxProps {
    photos: IPhoto[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

const MobileLightbox: React.FC<MobileLightboxProps> = ({
    photos,
    currentIndex,
    isOpen,
    onClose,
    onIndexChange,
}) => {
    const [showInfo, setShowInfo] = useState(false);
    const currentPhoto = photos[currentIndex];

    if (!isOpen || !currentPhoto) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
                <button className="p-2" onClick={onClose} aria-label="关闭">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex-1 text-center text-base font-bold truncate">{currentPhoto.title}</div>
                <button className="p-2" onClick={() => setShowInfo(true)} aria-label="信息">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            {/* 大图区域 */}
            <div className="flex-1 flex items-center justify-center bg-black">
                <Image
                    src={currentPhoto.src}
                    alt={currentPhoto.title || ''}
                    width={currentPhoto.width}
                    height={currentPhoto.height}
                    className="max-w-full max-h-[60vh] object-contain"
                    priority
                    draggable={false}
                />
            </div>
            {/* 缩略图条 */}
            <div className="w-full flex gap-2 px-2 py-2 overflow-x-auto bg-black">
                {photos.map((photo, idx) => (
                    <button
                        key={photo._id || idx}
                        className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 ${idx === currentIndex ? 'border-white' : 'border-transparent opacity-60'}`}
                        onClick={() => onIndexChange(idx)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.title || ''}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
            {/* 信息面板弹窗 */}
            {showInfo && (
                <div className="fixed inset-0 z-[11000] w-screen h-screen bg-black/90 flex flex-col">
                    {/* 顶部条美化 */}
                    <div className="absolute top-0 left-0 w-full h-12 bg-black/70 backdrop-blur flex items-center justify-between px-2">
                        <span className="text-base font-bold text-white flex-1 text-center">照片信息</span>
                        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white absolute right-2 top-1.5" onClick={() => setShowInfo(false)} aria-label="关闭信息面板">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto w-full h-full pt-12">
                        <PhotoInfo photo={currentPhoto} variant="sidebar" className="h-full w-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileLightbox; 