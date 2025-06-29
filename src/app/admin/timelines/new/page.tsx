'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button, Input, Space, Typography, message, Spin, DatePicker, Switch } from 'antd';
import { timelinesBusiness } from '@/app/business/timelines';
import dayjs from 'dayjs';
import "@/styles/markdown.css";

const { Title } = Typography;

// 动态导入 MarkdownEditor，禁用 SSR
const MarkdownEditor = dynamic(
    () => import('@/components/customMdRender/components/MarkdownEditor').then(mod => ({ default: mod.MarkdownEditor })),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Spin size="large" tip="正在加载编辑器..." />
            </div>
        )
    }
);

const initialContent = `# 开始编写你的时间轴详情...

## 事件概述

## 详细描述

## 收获与感悟
`;

// 从 Markdown 内容中提取标题
function extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : '新时间轴事件';
}

export default function NewTimelinePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [showSettingsForm, setShowSettingsForm] = useState(false);
    const [eventSettings, setEventSettings] = useState({
        title: '',
        description: '',
        location: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        isAdminOnly: false,
    });

    // 打开设置表单
    const handleSave = useCallback(() => {
        const title = extractTitle(content);
        setEventSettings(prev => ({ ...prev, title }));
        setShowSettingsForm(true);
    }, [content]);

    // 保存时间轴事件
    const saveEvent = async () => {
        try {
            setLoading(true);

            // 1. 上传 Markdown 内容到 OSS
            const markdownBlob = new Blob([content], { type: 'text/markdown' });
            const formData = new FormData();
            formData.append('file', markdownBlob, `timeline-${Date.now()}.md`);
            formData.append('directory', 'timelines'); // 指定目录

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.error || '上传文件失败');
            }

            const { url: ossPath } = await uploadResponse.json();

            // 2. 保存时间轴事件信息
            const response = await timelinesBusiness.createTimelineEvent({
                title: eventSettings.title,
                description: eventSettings.description,
                location: eventSettings.location || undefined,
                year: eventSettings.year,
                month: eventSettings.month,
                day: eventSettings.day,
                ossPath,
                isAdminOnly: eventSettings.isAdminOnly,
            });

            if (response) {
                // 3. 跳转到时间轴管理页
                router.push('/admin/timelines');
                message.success('保存成功');
            }
        } catch (error) {
            message.error(error instanceof Error ? error.message : '保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {!showSettingsForm ? (
                <>
                    {/* 编辑器工具栏 */}
                    <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
                        <Title level={4} style={{ margin: 0 }}>新建时间轴详情</Title>
                        <Space>
                            <Button onClick={() => router.push('/admin/timelines')} disabled={loading}>
                                取消
                            </Button>
                            <Button type="primary" onClick={handleSave} loading={loading}>
                                {loading ? '保存中...' : '保存'}
                            </Button>
                        </Space>
                    </div>

                    {/* MarkdownEditor */}
                    <div className="flex-1 h-[calc(100vh-57px)]">
                        <MarkdownEditor
                            initialContent={content}
                            onChange={setContent}
                        />
                    </div>
                </>
            ) : (
                <>
                    {/* 设置表单工具栏 */}
                    <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
                        <Title level={4} style={{ margin: 0 }}>设置时间轴事件信息</Title>
                        <Space>
                            <Button onClick={() => setShowSettingsForm(false)}>
                                返回编辑
                            </Button>
                            <Button type="primary" onClick={saveEvent} loading={loading}>
                                {loading ? '保存中...' : '确认保存'}
                            </Button>
                        </Space>
                    </div>

                    {/* 设置表单 */}
                    <div className="flex-1 p-6 bg-gray-50">
                        <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <Typography.Text className="block mb-2 font-medium">事件标题</Typography.Text>
                                    <Input
                                        size="large"
                                        value={eventSettings.title}
                                        onChange={(e) => setEventSettings(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="请输入事件标题"
                                    />
                                </div>
                                <div>
                                    <Typography.Text className="block mb-2 font-medium">事件描述</Typography.Text>
                                    <Input.TextArea
                                        rows={4}
                                        size="large"
                                        value={eventSettings.description}
                                        onChange={(e) => setEventSettings(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="请输入事件描述"
                                    />
                                </div>
                                <div>
                                    <Typography.Text className="block mb-2 font-medium">发生地点</Typography.Text>
                                    <Input
                                        size="large"
                                        value={eventSettings.location}
                                        onChange={(e) => setEventSettings(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="请输入发生地点（可选）"
                                    />
                                </div>
                                <div>
                                    <Typography.Text className="block mb-2 font-medium">事件日期</Typography.Text>
                                    <DatePicker
                                        size="large"
                                        value={dayjs(`${eventSettings.year}-${eventSettings.month.toString().padStart(2, '0')}-${eventSettings.day.toString().padStart(2, '0')}`)}
                                        onChange={(date) => {
                                            if (date) {
                                                setEventSettings(prev => ({
                                                    ...prev,
                                                    year: date.year(),
                                                    month: date.month() + 1,
                                                    day: date.date(),
                                                }));
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Typography.Text className="font-medium">仅管理员可见</Typography.Text>
                                    <Switch
                                        checked={eventSettings.isAdminOnly}
                                        onChange={(checked) => setEventSettings(prev => ({ ...prev, isAdminOnly: checked }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 