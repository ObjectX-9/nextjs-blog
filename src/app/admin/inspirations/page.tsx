"use client";

import { useState, useEffect } from "react";
import { IInspiration, IInspirationCreate } from "@/app/model/inspiration";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { inspirationsBusiness } from "@/app/business/inspirations";
import {
  Modal,
  Card,
  Button,
  Input,
  Upload,
  Tag,
  Space,
  Spin,
  message,
  Popconfirm,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { DouyinVideoPreview } from "@/components/DouyinVideoPreview";
import { RcFile } from "antd/es/upload";

const { TextArea } = Input;

// 快速发送灵感笔记的弹窗组件
const QuickInspirationDialog = ({
  onSubmit,
  open,
  onOpenChange,
}: {
  onSubmit: (data: { content: string; images: string[] }) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content, images });
      setContent("");
      setImages([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting inspiration:", error);
      message.error("发送失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: RcFile) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "inspirations");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("Invalid response format");
      }

      setImages((prev) => [...prev, data.url]);
      return false; // 阻止 Upload 组件默认上传行为
    } catch (error) {
      console.error("Error uploading images:", error);
      message.error("图片上传失败");
      return false;
    }
  };

  return (
    <Modal
      title="快速发送灵感笔记"
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={[
        <Button key="cancel" onClick={() => onOpenChange(false)}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          disabled={!content.trim()}
          onClick={handleSubmit}
          icon={<SendOutlined />}
        >
          发送
        </Button>,
      ]}
      width={600}
    >
      <TextArea
        placeholder="写下你的想法..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="mb-4"
      />

      <Upload
        listType="picture-card"
        fileList={images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: "done",
          url: url,
        }))}
        beforeUpload={handleImageUpload}
        onRemove={(file) => {
          setImages(images.filter((url) => url !== file.url));
          return true;
        }}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      </Upload>
    </Modal>
  );
};

export default function InspirationManagement() {
  const [inspirations, setInspirations] = useState<IInspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const router = useRouter();

  // 获取灵感笔记列表
  const fetchInspirations = async () => {
    try {
      const result = await inspirationsBusiness.getInspirations(1, 1000000);
      setInspirations(result.data as IInspiration[]);
    } catch (error) {
      console.error("Error fetching inspirations:", error);
      message.error("获取灵感笔记列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, []);

  // 快速发送灵感笔记
  const handleQuickPost = async (data: {
    content: string;
    images: string[];
  }) => {
    try {
      const inspirationData: IInspirationCreate = {
        title: data.content.substring(0, 50) || "快速笔记", // 使用内容的前50个字符作为标题
        content: data.content,
        images: data.images,
        status: "published",
      };

      await inspirationsBusiness.createInspiration(inspirationData);
      fetchInspirations();
      message.success("发送成功");
    } catch (error) {
      console.error("Error creating inspiration:", error);
      message.error("发送失败");
    }
  };

  // 删除灵感笔记
  const handleDelete = async (id: string) => {
    try {
      await inspirationsBusiness.deleteInspiration(id);
      fetchInspirations();
      message.success("删除成功");
    } catch (error) {
      console.error("Error deleting inspiration:", error);
      message.error("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[100vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">灵感笔记管理</h1>
        <Space>
          <Button
            onClick={() => setQuickPostOpen(true)}
            icon={<PlusOutlined />}
          >
            快速发送
          </Button>
          <Button
            type="primary"
            onClick={() => router.push("/admin/inspirations/new")}
            icon={<PlusOutlined />}
          >
            新建笔记
          </Button>
        </Space>
      </div>

      <QuickInspirationDialog
        open={quickPostOpen}
        onOpenChange={setQuickPostOpen}
        onSubmit={handleQuickPost}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inspirations?.map((inspiration) => (
          <Card
            key={inspiration._id?.toString()}
            className="h-full flex flex-col"
            bodyStyle={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "24px 24px 0",
            }}
            actions={[
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/admin/inspirations/${inspiration._id}/edit`)
                }
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确定要删除这条灵感笔记吗？"
                onConfirm={() =>
                  handleDelete(inspiration._id?.toString() || "")
                }
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <div className="flex flex-col flex-1">
              <div className="flex-1">
                {inspiration.title && (
                  <div className="text-lg font-medium mb-3">
                    {inspiration.title}
                  </div>
                )}

                {inspiration.videos && inspiration.videos.length > 0 ? (
                  <div className="relative aspect-video mb-3">
                    <DouyinVideoPreview url={inspiration.videos[0].url} />
                  </div>
                ) : inspiration.images && inspiration.images.length > 0 ? (
                  <div className="relative aspect-video mb-3">
                    <Image
                      src={inspiration.images[0]}
                      alt={inspiration.title || "灵感图片"}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  !inspiration.bilibili && (
                    <div className="relative aspect-video mb-3 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂无图片"
                        className="opacity-50"
                      />
                    </div>
                  )
                )}

                {inspiration.bilibili && (
                  <div className="mb-3">
                    <div className="relative aspect-video mb-2">
                      <iframe
                        src={`//player.bilibili.com/player.html?bvid=${inspiration.bilibili.bvid
                          }&page=${inspiration.bilibili.page || 1}`}
                        scrolling="no"
                        style={{ border: "none" }}
                        frameBorder="no"
                        allowFullScreen={true}
                        className="absolute inset-0 w-full h-full rounded-lg"
                      />
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      BV号: {inspiration.bilibili.bvid}
                      {inspiration.bilibili.title &&
                        ` | ${inspiration.bilibili.title}`}
                    </div>
                  </div>
                )}

                <div className="text-gray-600 mb-3 line-clamp-3">
                  {inspiration.content}
                </div>

                {inspiration.tags && inspiration.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {inspiration.tags.map((tag, index) => (
                      <Tag key={index} color="blue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 pb-6">
                <Space>
                  <span>浏览: {inspiration.views}</span>
                  <span>点赞: {inspiration.likes}</span>
                </Space>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
