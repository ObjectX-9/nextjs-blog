import Image from "next/image";
import { IFitnessRecord, IFitnessVideo } from "@/app/model/fitness";
import { useState, useEffect } from "react";

interface DouyinVideoInfo {
    videoUrl: string;
    coverUrl: string;
    title: string;
    author: string;
}

interface FitnessRecordCardProps {
    record: IFitnessRecord;
}

// 解析抖音视频的 hook
function useDouyinVideo(video: IFitnessVideo | undefined) {
    const [videoInfo, setVideoInfo] = useState<DouyinVideoInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!video?.isDouyin || !video.url) return;

        const fetchDouyinVideo = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/douyin/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: video.url }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setVideoInfo(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : '解析失败');
            } finally {
                setLoading(false);
            }
        };

        fetchDouyinVideo();
    }, [video?.isDouyin, video?.url]);

    return { videoInfo, loading, error };
}

export function FitnessRecordCard({ record }: FitnessRecordCardProps) {
    const [expandedImages, setExpandedImages] = useState<number | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    };

    const getDayOfMonth = (dateString: string) => {
        const date = new Date(dateString);
        return date.getDate();
    };

    const closeImageModal = () => {
        setExpandedImages(null);
    };

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Date circle */}
            <div className="absolute left-3 top-6 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
                {getDayOfMonth(record.date)}
            </div>

            {/* Card content */}
            <div className="ml-16 bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {record.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {formatDate(record.date)}
                        </p>
                    </div>
                    {record.isAdminOnly && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🔒 管理员可见
                        </span>
                    )}
                </div>

                {/* Description */}
                <div className="text-gray-700 mb-4 leading-relaxed">
                    {record.description}
                </div>

                {/* Images Grid */}
                {record.images && record.images.length > 0 && (
                    <div className="mb-4">
                        {record.images.length === 1 ? (
                            // Single image - adaptive size display
                            <div
                                className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg bg-gray-50 cursor-pointer"
                                onClick={() => setExpandedImages(0)}
                            >
                                <Image
                                    src={record.images[0].url}
                                    alt={record.images[0].caption || record.title}
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 max-h-[60vh]"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ) : record.images.length === 2 ? (
                            // Two images - side by side with better aspect ratio
                            <div className="grid grid-cols-2 gap-3">
                                {record.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-50 cursor-pointer"
                                        onClick={() => setExpandedImages(index)}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.caption || record.title}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 50vw, 400px"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Three or more images - responsive grid
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {record.images.slice(0, 6).map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-50 cursor-pointer"
                                        onClick={() => setExpandedImages(index)}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.caption || record.title}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 50vw, 200px"
                                        />
                                        {/* Show +N overlay for excess images */}
                                        {index === 5 && record.images && record.images.length > 6 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white text-lg font-semibold">
                                                    +{record.images.length - 6}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Videos */}
                {record.videos && record.videos.length > 0 && (
                    <div className="mb-4">
                        <div className={`grid gap-3 ${record.videos.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-1 md:grid-cols-2"
                            }`}>
                            {record.videos.map((video, index) => (
                                video.isDouyin ? (
                                    <DouyinVideoPlayer key={index} video={video} />
                                ) : (
                                    <div key={index} className="relative aspect-video overflow-hidden rounded-lg bg-gray-50 shadow-sm">
                                        <video
                                            src={video.url}
                                            controls
                                            className="w-full h-full object-cover"
                                            poster={video.thumbnail}
                                            preload="metadata"
                                        >
                                            <source src={video.url} />
                                            您的浏览器不支持视频播放
                                        </video>
                                        {video.title && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                                <p className="text-white text-sm font-medium">{video.title}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {expandedImages !== null && record.images && record.images[expandedImages] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={closeImageModal}
                            className="absolute -top-12 right-0 text-white text-xl font-bold hover:text-gray-300 z-10"
                        >
                            ✕
                        </button>
                        <Image
                            src={record.images[expandedImages].url}
                            alt={record.images[expandedImages].caption || record.title}
                            width={800}
                            height={600}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            sizes="80vw"
                        />
                        {record.images[expandedImages].caption && (
                            <p className="text-white text-center mt-4 text-sm">
                                {record.images[expandedImages].caption}
                            </p>
                        )}

                        {/* Navigation arrows for multiple images */}
                        {record.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedImages(expandedImages > 0 ? expandedImages - 1 : (record.images?.length || 1) - 1);
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedImages((expandedImages + 1) % (record.images?.length || 1));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                                >
                                    ›
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                    {record.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedImages(index);
                                            }}
                                            className={`w-2 h-2 rounded-full transition-colors ${index === expandedImages ? 'bg-white' : 'bg-white bg-opacity-50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// 抖音视频播放器组件
function DouyinVideoPlayer({ video }: { video: IFitnessVideo }) {
    const { videoInfo, loading, error } = useDouyinVideo(video);

    if (loading) {
        return (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-sm flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">正在解析视频...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-sm flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-red-500 text-sm mb-2">视频解析失败</p>
                    <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm hover:underline"
                    >
                        点击查看原视频 →
                    </a>
                </div>
            </div>
        );
    }

    if (!videoInfo?.videoUrl) {
        return (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-sm flex items-center justify-center">
                <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                >
                    点击查看视频 →
                </a>
            </div>
        );
    }

    // 使用代理地址解决跨域问题
    const proxyVideoUrl = `/api/douyin/proxy?url=${encodeURIComponent(videoInfo.videoUrl)}`;

    return (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-50 shadow-sm">
            <video
                src={proxyVideoUrl}
                controls
                className="w-full h-full object-contain bg-black"
                poster={videoInfo.coverUrl || video.thumbnail}
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
            >
                您的浏览器不支持视频播放
            </video>
            {(video.title || videoInfo.title) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                        {video.title || videoInfo.title}
                    </p>
                    {videoInfo.author && (
                        <p className="text-white/70 text-xs">@{videoInfo.author}</p>
                    )}
                </div>
            )}
        </div>
    );
}