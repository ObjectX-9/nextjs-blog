'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
    src: string;
    alt: string;
    onClose: () => void;
}

interface ImagePreviewHookProps {
    enableImagePreview?: boolean;
    containerRef: React.RefObject<HTMLElement>;
    content?: string;
}

// 图片预览弹窗组件
export const ImagePreview = ({
    src,
    alt,
    onClose
}: ImagePreviewProps) => {
    // 支持键盘ESC关闭
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        // 防止背景滚动
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center p-4">
                {/* 关闭按钮 */}
                <button
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70 transition-all"
                    onClick={onClose}
                    aria-label="关闭图片预览"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* 图片容器 */}
                <div className="relative w-full h-full">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain"
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.jpg";
                        }}
                        priority
                    />
                </div>

                {/* 图片信息 */}
                {alt && (
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                            {alt}
                        </div>
                    </div>
                )}

                {/* 操作提示 */}
                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 rounded-lg px-3 py-1 text-sm">
                    ESC 键关闭
                </div>
            </div>
        </div>
    );
};

// 图片预览钩子函数
export const useImagePreview = ({
    enableImagePreview = true,
    containerRef,
    content
}: ImagePreviewHookProps) => {
    const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

    useEffect(() => {
        if (!enableImagePreview || !containerRef.current) return;

        const handleImageClick = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                // 过滤掉小图标等不需要预览的图片
                if (img.width > 50 && img.height > 50) {
                    event.preventDefault();
                    setPreviewImage({
                        src: img.src,
                        alt: img.alt || '图片预览'
                    });
                }
            }
        };

        const handleMouseOver = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                if (img.width > 50 && img.height > 50) {
                    img.style.cursor = 'pointer';
                    img.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
                    img.style.transform = 'scale(1.02)';
                    img.style.opacity = '0.9';
                }
            }
        };

        const handleMouseOut = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                if (img.width > 50 && img.height > 50) {
                    img.style.transform = 'scale(1)';
                    img.style.opacity = '1';
                }
            }
        };

        const container = containerRef.current;
        container.addEventListener('click', handleImageClick);
        container.addEventListener('mouseover', handleMouseOver);
        container.addEventListener('mouseout', handleMouseOut);

        return () => {
            container.removeEventListener('click', handleImageClick);
            container.removeEventListener('mouseover', handleMouseOver);
            container.removeEventListener('mouseout', handleMouseOut);
        };
    }, [enableImagePreview, content, containerRef]);

    const closePreview = () => {
        setPreviewImage(null);
    };

    return {
        previewImage,
        closePreview
    };
}; 