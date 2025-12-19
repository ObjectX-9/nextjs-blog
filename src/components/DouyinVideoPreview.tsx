'use client';

import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DouyinVideoInfo {
    videoUrl: string;
    coverUrl: string;
    title: string;
    author: string;
}

interface DouyinVideoPreviewProps {
    url: string;
    className?: string;
}

// 抖音视频预览组件 - 自动加载
export function DouyinVideoPreview({ url, className = '' }: DouyinVideoPreviewProps) {
    const [videoInfo, setVideoInfo] = useState<DouyinVideoInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch('/api/douyin/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
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
        fetchVideo();
    }, [url]);

    if (loading) {
        return (
            <div className={`w-full h-full bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <Text className="text-xs text-gray-500">解析中...</Text>
                </div>
            </div>
        );
    }

    if (error || !videoInfo?.videoUrl) {
        return (
            <div className={`w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex flex-col items-center justify-center ${className}`}>
                <VideoCameraOutlined className="text-3xl text-pink-500 mb-2" />
                <Text className="text-sm text-gray-600">抖音视频</Text>
                {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-2 hover:underline">
                    查看原视频 →
                </a>
            </div>
        );
    }

    const proxyUrl = `/api/douyin/proxy?url=${encodeURIComponent(videoInfo.videoUrl)}`;
    return (
        <video
            src={proxyUrl}
            controls
            className={`w-full h-full object-contain bg-black rounded-lg ${className}`}
            poster={videoInfo.coverUrl}
            playsInline
        />
    );
}

// 用于前端展示的抖音视频播放器
export function DouyinVideoPlayer({ url, title, thumbnail }: { url: string; title?: string; thumbnail?: string }) {
    const [videoInfo, setVideoInfo] = useState<DouyinVideoInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch('/api/douyin/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
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
        fetchVideo();
    }, [url]);

    if (loading) {
        return (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-sm flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">正在解析抖音视频...</p>
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
                        href={url}
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
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                >
                    点击查看抖音视频 →
                </a>
            </div>
        );
    }

    const proxyUrl = `/api/douyin/proxy?url=${encodeURIComponent(videoInfo.videoUrl)}`;
    return (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-50 shadow-sm">
            <video
                src={proxyUrl}
                controls
                className="w-full h-full object-contain bg-black"
                poster={videoInfo.coverUrl || thumbnail}
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
            />
            {(title || videoInfo.title) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                        {title || videoInfo.title}
                    </p>
                    {videoInfo.author && (
                        <p className="text-white/70 text-xs">@{videoInfo.author}</p>
                    )}
                </div>
            )}
        </div>
    );
}
