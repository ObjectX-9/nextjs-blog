import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { IPhoto } from '@/app/model/photo';
import PhotoInfo from './PhotoInfo';
import dynamic from 'next/dynamic';

interface CustomLightboxProps {
    photos: IPhoto[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

const MobileLightbox = dynamic(() => import('./MobileLightbox'), { ssr: false });

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

const CustomLightbox: React.FC<CustomLightboxProps> = ({
    photos,
    currentIndex,
    isOpen,
    onClose,
    onIndexChange,
}) => {
    const [showPhotoInfo, setShowPhotoInfo] = useState(true);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTap, setLastTap] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [extractedColors, setExtractedColors] = useState<string[]>([]);
    const imageRef = useRef<HTMLDivElement>(null);

    const currentPhoto = photos[currentIndex];

    const isMobile = useIsMobile();

    // 从图片文件名或路径提取预设颜色 (临时方案)
    const getColorFromImagePath = (imageSrc: string): string => {
        // 基于图片名称或路径的简单哈希来生成色彩
        const hash = imageSrc.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const colors = [
            '#8B5A3C', // 棕色 - 适合风景照
            '#2C5F2D', // 森林绿
            '#1E3A8A', // 深蓝色 - 适合天空海洋
            '#7C2D12', // 深橙红色
            '#581C87', // 深紫色
            '#164E63', // 青色
            '#92400E', // 琥珀色
            '#374151', // 灰色
            '#1F2937', // 深灰色
            '#991B1B', // 深红色
        ];

        return colors[Math.abs(hash) % colors.length];
    };

    // 从图像提取颜色 (Canvas方法)
    const extractColorFromImage = useCallback((imageSrc: string) => {
        const img = document.createElement('img') as HTMLImageElement;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            try {
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;

                let r = 0, g = 0, b = 0;
                const pixelCount = data.length / 4;

                // 计算平均颜色
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                r = Math.floor(r / pixelCount);
                g = Math.floor(g / pixelCount);
                b = Math.floor(b / pixelCount);

                const extractedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                setExtractedColors([extractedColor]);
            } catch (error) {
                setExtractedColors([getColorFromImagePath(imageSrc)]);
            }
        };
        img.onerror = () => {
            setExtractedColors([getColorFromImagePath(imageSrc)]);
        };
        img.src = imageSrc;
    }, []);

    // 当照片改变时提取颜色
    useEffect(() => {
        if (currentPhoto?.src) {
            extractColorFromImage(currentPhoto.src);
        }
    }, [currentPhoto?.src, extractColorFromImage]);

    // 根据图片主色调生成动态背景
    const dynamicBackground = useMemo(() => {
        // 使用提取的颜色或预设颜色
        let colorsToUse: string[] = [];

        if (extractedColors.length > 0) {
            colorsToUse = extractedColors;
        } else {
            // 使用基于图片路径的预设颜色
            colorsToUse = [getColorFromImagePath(currentPhoto?.src || '')];
        }

        if (colorsToUse.length === 0) {
            return {
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                overlayColor: 'rgba(15, 23, 42, 0.8)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            };
        }

        const primaryColor = colorsToUse[0];

        // 将十六进制转换为RGB
        const hex = primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) || 0;
        const g = parseInt(hex.substr(2, 2), 16) || 0;
        const b = parseInt(hex.substr(4, 2), 16) || 0;

        // 生成浅色调用于背景
        const darkR = Math.max(0, Math.floor(r * 0.35));
        const darkG = Math.max(0, Math.floor(g * 0.35));
        const darkB = Math.max(0, Math.floor(b * 0.35));

        // 生成更浅的颜色用于渐变
        const mediumR = Math.max(0, Math.floor(r * 0.45));
        const mediumG = Math.max(0, Math.floor(g * 0.45));
        const mediumB = Math.max(0, Math.floor(b * 0.45));

        return {
            background: `linear-gradient(135deg, rgb(${darkR}, ${darkG}, ${darkB}), rgb(${mediumR}, ${mediumG}, ${mediumB}))`,
            overlayColor: `rgba(${darkR}, ${darkG}, ${darkB}, 0.8)`,
            textShadow: `0 2px 4px rgba(${darkR}, ${darkG}, ${darkB}, 0.8)`
        };
    }, [extractedColors, currentPhoto?.src]);

    // 重置缩放和位移
    const resetTransform = useCallback(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
    }, []);

    // 处理键盘事件
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        onIndexChange(currentIndex - 1);
                        resetTransform();
                    }
                    break;
                case 'ArrowRight':
                    if (currentIndex < photos.length - 1) {
                        onIndexChange(currentIndex + 1);
                        resetTransform();
                    }
                    break;
                case 'i':
                case 'I':
                    setShowPhotoInfo(!showPhotoInfo);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex, photos.length, onClose, onIndexChange, resetTransform, showPhotoInfo]);

    // 处理滚轮缩放
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.5, Math.min(3, scale + delta));
        setScale(newScale);

        if (newScale === 1) {
            setTranslate({ x: 0, y: 0 });
        }
    }, [scale]);

    // 处理鼠标拖拽
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - translate.x,
                y: e.clientY - translate.y,
            });
        }
    }, [scale, translate]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setTranslate({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, scale, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 处理触摸事件（移动端）
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const now = Date.now();
        const timeDiff = now - lastTap;

        if (timeDiff < 300 && timeDiff > 0) {
            // 双击缩放
            if (scale === 1) {
                setScale(2);
            } else {
                resetTransform();
            }
        }

        setLastTap(now);

        if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - translate.x,
                y: e.touches[0].clientY - translate.y,
            });
        }
    }, [lastTap, scale, translate, resetTransform]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isDragging && scale > 1 && e.touches.length === 1) {
            e.preventDefault();
            setTranslate({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y,
            });
        }
    }, [isDragging, scale, dragStart]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 切换照片信息显示
    const togglePhotoInfo = () => {
        setShowPhotoInfo(!showPhotoInfo);
    };

    // 导航到上一张
    const goToPrevious = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
            resetTransform();
            setIsLoading(true);
        }
    };

    // 导航到下一张
    const goToNext = () => {
        if (currentIndex < photos.length - 1) {
            onIndexChange(currentIndex + 1);
            resetTransform();
            setIsLoading(true);
        }
    };

    // 格式化拍摄参数
    const formatShootingParams = (photo: IPhoto) => {
        const params: string[] = [];
        if (photo.exif?.FocalLength) params.push(photo.exif.FocalLength);
        if (photo.exif?.Aperture) params.push(`f/${photo.exif.Aperture}`);
        if (photo.exif?.ShutterSpeed) params.push(photo.exif.ShutterSpeed);
        if (photo.exif?.ISO) params.push(`ISO${photo.exif.ISO}`);
        return params.join(' · ');
    };

    console.log('CustomLightbox渲染检查:', {
        isOpen,
        currentIndex,
        photosLength: photos.length,
        currentPhoto: currentPhoto ? '存在' : '不存在'
    });

    if (!isOpen || !currentPhoto) {
        console.log('CustomLightbox不渲染，原因:', { isOpen, currentPhoto: !!currentPhoto });
        return null;
    }

    if (isMobile) {
        return (
            <MobileLightbox
                photos={photos}
                currentIndex={currentIndex}
                isOpen={isOpen}
                onClose={onClose}
                onIndexChange={onIndexChange}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 flex transition-all duration-700 ease-out"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                overflow: 'hidden'
            }}
        >
            {/* 背景图片层 */}
            <div
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                    backgroundImage: `url(${currentPhoto.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px) brightness(0.7) saturate(0.15) contrast(0.7)',
                    transform: 'scale(1.1)', // 避免模糊边缘
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
            />

            {/* 渐变叠加层 */}
            <div
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                    background: `linear-gradient(135deg, 
                        rgba(0, 0, 0, 0.7), 
                        rgba(0, 0, 0, 0.4), 
                        rgba(0, 0, 0, 0.6)
                    )`,
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
            />
            {/* 左侧主图区域 */}
            <div className={`transition-all duration-300 ease-in-out ${showPhotoInfo ? 'flex-1 relative' : 'w-full relative'} overflow-hidden`}>
                {/* 顶部工具栏 */}
                <div
                    className="absolute top-0 left-0 right-0 z-20 p-6"
                    style={{
                        background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)`
                    }}
                >
                    <div className="flex justify-between items-center">
                        {/* 左侧照片标题和信息 */}
                        <div className="text-white">
                            <h1
                                className="text-2xl font-light mb-1"
                                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                            >
                                {currentPhoto.title}
                            </h1>
                            {currentPhoto.location && (
                                <p
                                    className="text-gray-300 text-sm mb-2 flex items-center gap-1"
                                    style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {currentPhoto.location}
                                </p>
                            )}
                            {formatShootingParams(currentPhoto) && (
                                <p
                                    className="text-gray-400 text-xs font-mono"
                                    style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                                >
                                    {formatShootingParams(currentPhoto)}
                                </p>
                            )}
                        </div>

                        {/* 右侧操作按钮 */}
                        <div className="flex items-center gap-3">
                            {/* 信息面板切换 */}
                            <button
                                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
                                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                                onClick={togglePhotoInfo}
                                title={showPhotoInfo ? "隐藏信息面板" : "显示信息面板"}
                            >
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* 关闭按钮 */}
                            <button
                                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
                                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                                onClick={onClose}
                                title="关闭 (Esc)"
                            >
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 导航按钮 */}
                {photos.length > 1 && (
                    <>
                        {/* 上一张 */}
                        {currentIndex > 0 && (
                            <button
                                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                }}
                                onClick={goToPrevious}
                                title="上一张 (←)"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* 下一张 */}
                        {currentIndex < photos.length - 1 && (
                            <button
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                }}
                                onClick={goToNext}
                                title="下一张 (→)"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </>
                )}

                {/* 图片容器 */}
                <div
                    ref={imageRef}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="transition-transform duration-200 ease-out"
                        style={{
                            transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
                            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                        }}
                    >
                        <Image
                            src={currentPhoto.src}
                            alt={currentPhoto.title || ''}
                            width={currentPhoto.width}
                            height={currentPhoto.height}
                            className="max-w-[85vw] max-h-[85vh] object-contain drop-shadow-2xl"
                            priority
                            draggable={false}
                            onLoad={() => setIsLoading(false)}
                        />
                    </div>

                    {/* 加载状态 */}
                    {isLoading && (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                        >
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>

                {/* 底部信息栏 */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-20 p-6"
                    style={{
                        background: `linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)`
                    }}
                >
                    <div className="flex justify-between items-center text-white">
                        {/* 照片计数 */}
                        {photos.length > 1 && (
                            <div
                                className="text-sm font-light"
                                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                            >
                                {currentIndex + 1} / {photos.length}
                            </div>
                        )}

                        {/* 操作提示 */}
                        <div
                            className="text-xs text-gray-400 hidden md:block"
                            style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                        >
                            <span>← → 切换</span>
                            <span className="mx-2">•</span>
                            <span>滚轮缩放</span>
                            <span className="mx-2">•</span>
                            <span>I 信息</span>
                            <span className="mx-2">•</span>
                            <span>ESC 关闭</span>
                        </div>

                        {/* 缩放指示器 */}
                        {scale !== 1 && (
                            <div
                                className="text-sm px-2 py-1 rounded backdrop-blur-sm"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                                }}
                            >
                                {Math.round(scale * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* 缩略图导航栏（只在主图区域底部显示，不延伸到信息面板下方） */}
                {photos.length > 1 && (
                    <div className="absolute left-0 right-0 bottom-0 z-30">
                        <div
                            className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent backdrop-blur-md bg-black/30 rounded-t-lg"
                            style={{ minHeight: 64 }}
                        >
                            {photos.map((photo, index) => (
                                <button
                                    key={photo._id || index}
                                    className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden transition-all duration-200 border-2 ${index === currentIndex
                                        ? 'border-white ring-2 ring-white scale-110 shadow-lg'
                                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}
                                `}
                                    onClick={() => {
                                        onIndexChange(index);
                                        resetTransform();
                                    }}
                                    style={{ background: '#222' }}
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
                    </div>
                )}
            </div>

            {/* 右侧信息面板 */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showPhotoInfo ? 'w-96 opacity-100' : 'w-0 opacity-0'
                }`}>
                <div
                    className="h-full w-96 border-l overflow-y-auto"
                    style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <PhotoInfo
                        photo={currentPhoto}
                        variant="sidebar"
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomLightbox; 