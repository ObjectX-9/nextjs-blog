"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    Button,
    Modal,
    Form,
    Input,
    Spin,
    Space,
    Typography,
    Switch,
} from "antd";

import { ITimelineEvent } from "@/app/model/timeline";
import "@/styles/markdown.css";
import { timelinesBusiness } from "@/app/business/timelines";

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

const { Title } = Typography;

const EditTimelineContent = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [eventSettings, setEventSettings] = useState({
        title: "",
        description: "",
        isAdminOnly: false,
    });
    const [initialContentState, setInitialContentState] = useState("");
    const [contentLoaded, setContentLoaded] = useState(false);

    // 获取时间轴事件内容（只在首次加载时执行）
    useEffect(() => {
        if (contentLoaded) return; // 避免重复加载覆盖用户编辑内容

        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await timelinesBusiness.getTimelineEvent(params.id);

                // 通过代理API从OSS路径获取内容
                let eventContent = "";
                if (response.ossPath) {
                    try {
                        const contentResponse = await fetch(`/api/proxy-content?url=${encodeURIComponent(response.ossPath)}`);
                        if (contentResponse.ok) {
                            const data = await contentResponse.json();
                            eventContent = data.data.content;
                        } else {
                            const errorData = await contentResponse.json();
                            console.error("获取文件内容失败:", errorData.error);
                        }
                    } catch (error) {
                        console.error("获取文件内容失败:", error);
                    }
                }

                setInitialContentState(eventContent);
                setContent(eventContent);
                setContentLoaded(true); // 标记内容已加载

                // 设置事件其他信息
                const settings = {
                    title: response.title || "",
                    description: response.description || "",
                    isAdminOnly: response.isAdminOnly || false,
                };
                setEventSettings(settings);
                form.setFieldsValue(settings);
            } catch (error) {
                console.error("获取时间轴事件失败:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [params.id, contentLoaded]);

    // 页面刷新/关闭保护
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (content !== initialContentState && content.trim()) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [content, initialContentState]);

    // 打开设置对话框
    const handleSave = useCallback(() => {
        if (!content.trim()) {
            Modal.warning({
                title: "内容为空",
                content: "请输入时间轴详情内容后再保存",
            });
            return;
        }
        setShowSettingsDialog(true);
    }, [content]);

    // 保存时间轴事件
    const saveEvent = async (formValues: any) => {
        try {
            setLoading(true);

            // 1. 上传 Markdown 内容到 OSS
            const markdownBlob = new Blob([content], {
                type: "text/markdown; charset=UTF-8",
            });
            const formData = new FormData();
            formData.append("file", markdownBlob, `timeline-${Date.now()}.md`);
            formData.append("directory", "timelines");

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                console.error("上传失败详情:", {
                    status: uploadResponse.status,
                    statusText: uploadResponse.statusText,
                    error: error,
                });
                throw new Error(
                    error.error ||
                    `上传文件失败: ${uploadResponse.status} ${uploadResponse.statusText}`
                );
            }

            const { url: ossPath } = await uploadResponse.json();

            // 2. 获取原有事件数据
            const originalEvent = await timelinesBusiness.getTimelineEvent(params.id);

            // 3. 保存事件信息
            const response = await timelinesBusiness.updateTimelineEvent({
                ...originalEvent,
                _id: params.id,
                title: formValues.title,
                description: formValues.description,
                ossPath,
                isAdminOnly: formValues.isAdminOnly,
                updatedAt: new Date().toISOString(),
            });

            if (response) {
                // 更新本地状态，标记内容已保存
                setInitialContentState(content);

                // 保存成功提示
                Modal.success({
                    title: "保存成功",
                    content: "时间轴详情已成功保存",
                    onOk: () => {
                        // 跳转到时间轴管理页
                        router.push("/admin/timelines");
                    },
                });
                // 保存成功后关闭对话框
                setShowSettingsDialog(false);
            }
        } catch (error) {
            Modal.error({
                title: "保存失败",
                content: error instanceof Error ? error.message : "保存失败，请重试",
            });
            // 保存失败时不关闭对话框，让用户可以重试
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values: any) => {
        setEventSettings(values);
        await saveEvent(values);
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
                <Title level={4} style={{ margin: 0 }}>{eventSettings.title || '编辑时间轴详情'}</Title>
                <Space>
                    <Button
                        onClick={() => {
                            if (content !== initialContentState && content.trim()) {
                                Modal.confirm({
                                    title: '确认离开',
                                    content: '您有未保存的更改，确定要离开吗？',
                                    onOk: () => router.push("/admin/timelines"),
                                });
                            } else {
                                router.push("/admin/timelines");
                            }
                        }}
                        disabled={loading}
                    >
                        取消
                    </Button>
                    <Button type="primary" onClick={handleSave} loading={loading}>
                        {loading ? '保存中...' : '保存'}
                    </Button>
                </Space>
            </div>

            <div className="flex-1 h-[calc(100vh-57px)]">
                {loading || !contentLoaded ? (
                    <div className="flex justify-center items-center h-full">
                        <Spin size="large" tip="正在加载编辑器..." />
                    </div>
                ) : (
                    <MarkdownEditor
                        key={`editor-${params.id}`} // 使用key确保编辑器在ID变化时重新初始化
                        initialContent={initialContentState}
                        onChange={(value) => setContent(value)}
                    />
                )}
            </div>

            <Modal
                title="时间轴事件设置"
                open={showSettingsDialog}
                onCancel={() => setShowSettingsDialog(false)}
                footer={null}
                width={500}
                maskClosable={false}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={eventSettings}
                    disabled={loading}
                >
                    <Form.Item
                        name="title"
                        label="事件标题"
                        rules={[{ required: true, message: "请输入事件标题" }]}
                    >
                        <Input placeholder="请输入事件标题" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="事件描述"
                        rules={[{ required: true, message: "请输入事件描述" }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入事件描述" />
                    </Form.Item>

                    <Form.Item
                        name="isAdminOnly"
                        label="仅管理员可见"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Button
                            className="mr-2"
                            onClick={() => setShowSettingsDialog(false)}
                        >
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            确认并保存
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EditTimelineContent; 