'use client';

import { useState } from 'react';
import { Card, Input, Button, Typography, Space, message, Spin, Descriptions, Image } from 'antd';
import { SearchOutlined, CopyOutlined, PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface VideoInfo {
    videoUrl: string;
    coverUrl: string;
    title: string;
    author: string;
    authorAvatar?: string;
    videoId: string;
}

export default function DouyinParsePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

    const handleParse = async () => {
        if (!url.trim()) {
            message.warning('请输入抖音视频链接');
            return;
        }

        setLoading(true);
        setVideoInfo(null);

        try {
            const res = await fetch('/api/douyin/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '解析失败');
            }

            setVideoInfo(data);
            message.success('解析成功');
        } catch (error) {
            message.error(error instanceof Error ? error.message : '解析失败');
        } finally {
            setLoading(false);
        }
    };


    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        message.success(`${label}已复制`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Title level={2}>抖音视频解析</Title>
            <Text type="secondary" className="mb-6 block">
                输入抖音分享链接，获取无水印视频地址
            </Text>

            <Card className="mb-6">
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        size="large"
                        placeholder="粘贴抖音分享链接，如: https://v.douyin.com/xxxxx/"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onPressEnter={handleParse}
                        allowClear
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={handleParse}
                        loading={loading}
                    >
                        解析
                    </Button>
                </Space.Compact>
            </Card>

            {loading && (
                <Card>
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-500">正在解析视频...</div>
                    </div>
                </Card>
            )}

            {videoInfo && !loading && (
                <Card title="解析结果">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* 封面预览 */}
                        <div className="flex-shrink-0">
                            {videoInfo.coverUrl && (
                                <Image
                                    src={videoInfo.coverUrl}
                                    alt="视频封面"
                                    width={200}
                                    style={{ borderRadius: 8 }}
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAJpAN4pokyXwAAAABJRU5ErkJggg=="
                                />
                            )}
                        </div>


                        {/* 视频信息 */}
                        <div className="flex-1">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="标题">
                                    <Text>{videoInfo.title || '无标题'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="作者">
                                    <Space>
                                        {videoInfo.authorAvatar && (
                                            <Image
                                                src={videoInfo.authorAvatar}
                                                alt="作者头像"
                                                width={24}
                                                height={24}
                                                style={{ borderRadius: '50%' }}
                                                preview={false}
                                            />
                                        )}
                                        <Text>{videoInfo.author || '未知'}</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="视频ID">
                                    <Text code>{videoInfo.videoId}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <div className="mt-4 space-y-3">
                                {/* 视频地址 */}
                                {videoInfo.videoUrl && (
                                    <div>
                                        <Text type="secondary" className="block mb-1">无水印视频地址:</Text>
                                        <Input.TextArea
                                            value={videoInfo.videoUrl}
                                            readOnly
                                            autoSize={{ minRows: 2, maxRows: 4 }}
                                        />
                                        <Space className="mt-2">
                                            <Button
                                                icon={<CopyOutlined />}
                                                onClick={() => copyToClipboard(videoInfo.videoUrl, '视频地址')}
                                            >
                                                复制地址
                                            </Button>
                                            <Button
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => window.open(videoInfo.videoUrl, '_blank')}
                                            >
                                                播放视频
                                            </Button>
                                            <Button
                                                icon={<DownloadOutlined />}
                                                type="primary"
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = videoInfo.videoUrl;
                                                    a.download = `${videoInfo.videoId}.mp4`;
                                                    a.click();
                                                }}
                                            >
                                                下载视频
                                            </Button>
                                        </Space>
                                    </div>
                                )}


                                {/* 封面地址 */}
                                {videoInfo.coverUrl && (
                                    <div>
                                        <Text type="secondary" className="block mb-1">封面地址:</Text>
                                        <Input.TextArea
                                            value={videoInfo.coverUrl}
                                            readOnly
                                            autoSize={{ minRows: 2, maxRows: 4 }}
                                        />
                                        <Button
                                            icon={<CopyOutlined />}
                                            className="mt-2"
                                            onClick={() => copyToClipboard(videoInfo.coverUrl, '封面地址')}
                                        >
                                            复制封面地址
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="mt-6" size="small">
                <Title level={5}>支持的链接格式</Title>
                <ul className="text-gray-500 text-sm space-y-1">
                    <li>• 短链接: https://v.douyin.com/xxxxx/</li>
                    <li>• 完整链接: https://www.douyin.com/video/7123456789012345678</li>
                    <li>• 分享文本中的链接也可以直接粘贴</li>
                </ul>
            </Card>
        </div>
    );
}